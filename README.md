[![Continuous Integration](https://github.com/kaiosilveira/nodejs-fail-fast/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/nodejs-fail-fast/actions/workflows/ci.yml)

_This repository is an example implementation in NodeJS of the "Let it crash!" philosophy, as described in the "Release it!" book, by Michael T Nygard, and is part of my Stability Patterns Series. Check out [kaiosilveira/stability-patterns](https://github.com/kaiosilveira/stability-patterns) for more details._

# Let it crash!

We start to understand production when we decide to give up of component-level stability in favor of system-level stability. This means that, sometimes, it's just better to let a component crash miserably and recreate it from scratch than trying to keep it alive at all costs. I've gone through the path of trying to capture and handle appropriately all possible exceptions myself a few times, and the result was almost madness because of the number of different error codes in different application layers and what I should do with that. Depending on how fast we can spin up a new instance of the component, it's just better to do it instead. This application is a working example of this idea.

## Implementation details

To give a simple yet complete example, this application implements a "to-do list", built using Express, that applies the "Let it crash!" philosophy. It runs on an application-managed NodeJS cluster, with one process worker allocated for each CPU core. My test was made in a eight-core MacBook Pro, but it should work just fine for any other multi-core spec as well.

### Cluster configuration

The cluster configuration is made in the entry-point file of the application. There, we check whether the current process is the primary replica or not. If it is, then we start forking new workers, otherwise we just spin up a new express web server. The code that makes this decision looks like this:

```typescript
if (ConcreteCluster.isPrimary) forkWorkers({ env, cluster: ConcreteCluster, logger });
else {
  initExpressWebServerWorker({
    env,
    logger,
    createHTTPServer: http.createServer,
    expressApp: ExpressAppFactory.createApp({ env, logger }),
  });
}
```

The `forkWorkers` function queries the `env` for the number of available CPU's and then starts forking. The code looks like this:

```typescript
export type ForkWorkersFnProps = { env: ApplicationEnv; logger: ILogger; cluster: Cluster };

const forkWorkers = ({ env, logger, cluster }: ForkWorkersFnProps) => {
  const { AVAILABLE_CPUs } = env;
  logger.info({ msg: `Number of available CPUs is ${AVAILABLE_CPUs}` });
  logger.info({ msg: `Primary replica ${env.PID} is running` });

  for (let i = 0; i < AVAILABLE_CPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', handleWorkerExit({ cluster, logger }));
};
```

The `handleWorkerExit` function ensures that we are creating a new worker whenever an existing worker dies (i.e. exits with a status code different than zero), and it looks like this:

```typescript
export type HandleWorkerExitFnProps = { cluster: Cluster; logger: ILogger };

const handleWorkerExit = ({ cluster, logger }: HandleWorkerExitFnProps) => {
  return (worker: Worker, code: number, signal?: number) => {
    const logProps = { pId: worker.process.pid, at: new Date() };

    if (code === 0) {
      logger.info({ msg: `worker ${worker.process.pid} exited with code '0'`, ...logProps });
    } else {
      logger.info({
        msg: `worker ${worker.process.pid} died with code '${code}' and signal '${signal}'. Forking a new one...`,
        ...logProps,
      });

      cluster.fork();
    }
  };
};
```

The `initExpressWebServerWorker` function, as its name is suggesting, simply initiates a child express web server:

```typescript
const initExpressWebServerWorker = ({
  env,
  logger,
  expressApp,
  createHTTPServer,
}: InitExpressWebServerWorkerFnProps) => {
  logger.info({ msg: `Worker ${env.PID} started`, pId: env.PID, at: new Date() });
  process.on('uncaughtException', logUncaughtExceptionAndExit({ env, logger }));

  createHTTPServer(expressApp).listen(env.PORT, () =>
    logger.info({
      msg: `worker ${env.PID} listening at ${env.PORT} ????`,
      pId: env.PID,
      at: new Date(),
    })
  );
};
```

And, with that, we're all set! The app initialization output looks like this:

```console
??? yarn dev
yarn run v1.22.19
$ ts-node src/index.ts
{"msg":"Number of available CPUs is 8"}
{"msg":"Primary replica 94977 is running"}
{"msg":"Worker 94985 started","pId":94985,"at":"2022-10-15T12:18:59.965Z"}
{"msg":"worker 94985 listening at 3000 ????","pId":94985,"at":"2022-10-15T12:18:59.980Z"}
{"msg":"Worker 94984 started","pId":94984,"at":"2022-10-15T12:19:00.467Z"}
{"msg":"worker 94984 listening at 3000 ????","pId":94984,"at":"2022-10-15T12:19:00.473Z"}
{"msg":"Worker 94983 started","pId":94983,"at":"2022-10-15T12:19:00.474Z"}
{"msg":"Worker 94986 started","pId":94986,"at":"2022-10-15T12:19:00.477Z"}
{"msg":"worker 94986 listening at 3000 ????","pId":94986,"at":"2022-10-15T12:19:00.482Z"}
{"msg":"Worker 94989 started","pId":94989,"at":"2022-10-15T12:19:00.486Z"}
{"msg":"worker 94983 listening at 3000 ????","pId":94983,"at":"2022-10-15T12:19:00.488Z"}
{"msg":"worker 94989 listening at 3000 ????","pId":94989,"at":"2022-10-15T12:19:00.492Z"}
{"msg":"Worker 94982 started","pId":94982,"at":"2022-10-15T12:19:00.498Z"}
{"msg":"worker 94982 listening at 3000 ????","pId":94982,"at":"2022-10-15T12:19:00.509Z"}
{"msg":"Worker 94988 started","pId":94988,"at":"2022-10-15T12:19:00.523Z"}
{"msg":"worker 94988 listening at 3000 ????","pId":94988,"at":"2022-10-15T12:19:00.528Z"}
{"msg":"Worker 94987 started","pId":94987,"at":"2022-10-15T12:19:00.549Z"}
{"msg":"worker 94987 listening at 3000 ????","pId":94987,"at":"2022-10-15T12:19:00.553Z"}
```

### Forcefully causing application instabilities

We need a way to make the application crash randomly, so we can visually see the worker recycling mechanism in place. To do so, the `TodoController` was changed to throw an exception if its current request count is divisible by 5 and its process identifier is an even number:

```typescript
class TodoController {
  list(req: Request, res: Response) {
    this._requestCount++;
    if (this._requestCount % 5 === 0 && this._env.PID % 2 === 0) {
      this._logger.error({ msg: 'Mocked error', ...req.context });
      throw new Error('Mocked error');
    } else {
      res.json(MOCKED_TODO_LIST);
    }
  }
}
```

As there is no error handling inside the controller boundary, this exception will be caught only by the `logUncaughtExceptionAndExit` event handler that we registered into `process.on('uncaughtException')` previously when spinning up the web server. As `logUncaughtExceptionAndExit` only logs the exception and exits the process, the worker will die, causing `handleWorkerExit` to spin up a new worker. The questions, now, are:

- how long does it take to replace the worker that just died?
- is it efficient? Does it worth it?

To answer these questions, let's have a closer look at the log data generated by the application in the section below.

### Log data

To make the application produce some logs by itself, it was targeted by a simple `loadtest` execution of 4 requests per second:

```console
loadtest --rps 4 'http://localhost:3000/to-dos' -H x-user-id:fuhdafhda-fdsfdsaf-fdsfd-dsfds-fddg
```

The table below shows a fraction of the log data, with several log fields ignored for simplicity (if you're interested in seeing the full picture, just clone this repo and run it locally):

| Message                                                                 | Status Code | Date                     | Process ID |
| ----------------------------------------------------------------------- | ----------- | ------------------------ | ---------- |
| GET /to-dos 200 (0ms)                                                   | 200         | 2022-10-14T12:23:04.742Z | 50553      |
| GET /to-dos 200 (1ms)                                                   | 200         | 2022-10-14T12:23:04.996Z | 50421      |
| A Fatal error has occurred                                              | -           | 2022-10-14T12:23:05.248Z | 50556      |
| worker 50556 died with code '1' and signal 'null'. Forking a new one... | -           | 2022-10-14T12:23:05.262Z | 50556      |
| GET /to-dos 200 (0ms)                                                   | 200         | 2022-10-14T12:23:05.492Z | 50423      |
| GET /to-dos 200 (1ms)                                                   | 200         | 2022-10-14T12:23:05.743Z | 50557      |
| GET /to-dos 200 (0ms)                                                   | 200         | 2022-10-14T12:23:05.992Z | 50427      |
| GET /to-dos 200 (0ms)                                                   | 200         | 2022-10-14T12:23:06.242Z | 50549      |
| GET /to-dos 200 (1ms)                                                   | 200         | 2022-10-14T12:23:06.497Z | 50425      |
| GET /to-dos 200 (1ms)                                                   | 200         | 2022-10-14T12:23:06.742Z | 50553      |
| GET /to-dos 200 (1ms)                                                   | 200         | 2022-10-14T12:23:06.995Z | 50421      |
| Worker 50595 started                                                    | -           | 2022-10-14T12:23:07.028Z | 50595      |
| worker 50595 listening at 3000 ????                                       | -           | 2022-10-14T12:23:07.041Z | 50595      |

We can see by the above data that the worker with `pid: 50556` died at 12:23:05, being replaced by the new worker with `pid: 50595` at 12:23:07, which basically shows that it took around 2 seconds for a full worker replacement. We can also see that, as each worker is independent, the other ones kept handling requests normally while the recycling process was in place. Does it worth it, then? I'd say it depends on the load the application usually handles, and how many CPU's you have available in your machine. If it has a light traffic and four to eight cores, two seconds wouldn't be even perceived by the clients.

### Conclusion

This simplistic example showed one of the many ways we can use to create system-level stability by giving up of component-level stability. Modern applications usually run in containers, with supervisors ensuring that the number of replicas running stays the same, therefore application-level clustering is not a common approach anymore. In a real-world scenario, though, the idea here would be applied to the containers. In the book, Nygard shares some time scale ideas so we can have a sense of what to do depending on the situation. He says:

- We're running Go binaries in a container. Startup time for a new container and a process in it is measured in milliseconds. Crash the whole container;

- It's a NodeJS service running on a long-running virtual machine in AWS. Starting the NodeJS process takes milliseconds, but starting a new VM takes minutes. In this case, just crash the NodeJS process;

- An aging JavaEE application with an API pranged into the front end runs on virtual machines in a data center. Startup time is measured in minutes. "Let it crash!" is not the right strategy.

Our case, of course, is the second one. And the startup time is taking seconds instead of milliseconds because we are spinning up a full-fledged express web server instead of recreating a NodeJS process, but the idea still applies.

import { Express } from 'express';
import { ApplicationEnv } from '../../../config/env';
import ILogger from '../../../observability/logger';

const logUncaughtExceptionAndExit = ({ env, logger }: { env: ApplicationEnv; logger: ILogger }) => {
  return (err: Error) => {
    logger.error({
      msg: 'A Fatal error has occurred',
      stack: err.stack,
      errMsg: err.message,
      pId: env.PID,
      at: new Date(),
    });

    process.exit(1);
  };
};

export type InitExpressWebServerWorkerFnProps = {
  env: ApplicationEnv;
  logger: ILogger;
  expressApp: Express;
  createHTTPServer: Function;
};

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
      msg: `worker ${env.PID} listening at ${env.PORT} 🚀`,
      pId: env.PID,
      at: new Date(),
    })
  );
};

export default initExpressWebServerWorker;

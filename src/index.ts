import http from 'http';
import Cluster from 'node:cluster';
import { ApplicationEnv } from './config/env';
import ExpressAppFactory from './presentation/factory';
import { ConsoleLogger } from './monitoring/logger';

const PORT = Number(process.env.PORT) || 3000;
const AVAILABLE_CPUs = require('os').cpus().length;
const logger = new ConsoleLogger();

if (Cluster.isPrimary) {
  logger.info({ msg: `Available of CPUs is ${AVAILABLE_CPUs}` });
  logger.info({ msg: `Primary replica ${process.pid} is running` });

  for (let i = 0; i < AVAILABLE_CPUs; i++) {
    Cluster.fork();
  }

  Cluster.on('exit', (worker, code, signal) => {
    logger.info({
      msg: `worker ${worker.process.pid} died with code '${code}' and signal '${signal}'. Forking a new one...`,
      pId: worker.process.pid,
      at: new Date(),
    });

    Cluster.fork();
  });
} else {
  logger.info({ msg: `Worker ${process.pid} started`, pId: process.pid, at: new Date() });
  const env: ApplicationEnv = {
    NODE_ENV: process.env.NODE_ENV || 'dev',
    COMMIT_SHA: process.env.COMMIT_SHA || 'unknown',
    NODE_VERSION: process.version,
    PID: process.pid,
  };

  process.on('uncaughtException', err => {
    logger.error({
      msg: `A Fatal error has occurred`,
      stack: err.stack,
      errMsg: err.message,
      pId: env.PID,
      at: new Date(),
    });

    process.exit(1);
  });

  const app = ExpressAppFactory.createApp({ env, logger });
  http.createServer(app).listen(PORT, () =>
    logger.info({
      msg: `worker ${env.PID} listening at ${PORT} 🚀`,
      pId: env.PID,
      at: new Date(),
    })
  );
}

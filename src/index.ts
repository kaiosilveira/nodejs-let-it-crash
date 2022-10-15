import ConcreteCluster from 'node:cluster';
import http from 'http';
import { ApplicationEnv } from './application/config/env';
import { ConsoleLogger } from './application/observability/logger';
import forkWorkers from './application/core/cluster/fork-workers';
import initExpressWebServerWorker from './application/core/cluster/init-worker';
import ExpressAppFactory from './presentation/factory';

const logger = new ConsoleLogger();
const env: ApplicationEnv = {
  PORT: Number(process.env.PORT) || 3000,
  AVAILABLE_CPUs: require('os').cpus().length,
  NODE_ENV: process.env.NODE_ENV || 'dev',
  COMMIT_SHA: process.env.COMMIT_SHA || 'unknown',
  NODE_VERSION: process.version,
  PID: process.pid,
};

if (ConcreteCluster.isPrimary) forkWorkers({ env, cluster: ConcreteCluster, logger });
else {
  initExpressWebServerWorker({
    env,
    logger,
    createHTTPServer: http.createServer,
    expressApp: ExpressAppFactory.createApp({ env, logger }),
  });
}

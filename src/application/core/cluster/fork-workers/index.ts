import { Cluster } from 'cluster';
import { ApplicationEnv } from '../../../config/env';
import ILogger from '../../../observability/logger';
import handleWorkerExit from '../handle-worker-exit';

export type ForkWorkersFnProps = { env: ApplicationEnv; logger: ILogger; cluster: Cluster };

const forkWorkers = ({ env, logger, cluster }: ForkWorkersFnProps) => {
  const { AVAILABLE_CPUs } = env;
  logger.info({ msg: `Available of CPUs is ${AVAILABLE_CPUs}` });
  logger.info({ msg: `Primary replica ${env.PID} is running` });

  for (let i = 0; i < AVAILABLE_CPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', handleWorkerExit({ cluster, logger }));
};

export default forkWorkers;

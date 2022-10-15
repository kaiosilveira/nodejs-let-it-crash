import { Cluster, Worker } from 'cluster';
import ILogger from '../../../observability/logger';

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

export default handleWorkerExit;

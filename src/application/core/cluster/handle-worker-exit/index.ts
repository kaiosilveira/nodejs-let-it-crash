import { Cluster, Worker } from 'cluster';
import ILogger from '../../../observability/logger';

const handleWorkerExit = ({ cluster, logger }: { cluster: Cluster; logger: ILogger }) => {
  return (worker: Worker, code: number, signal?: number) => {
    if (code === 0) {
      logger.info({
        msg: `worker ${worker.process.pid} exited with code '0'`,
        pId: worker.process.pid,
        at: new Date(),
      });
      return;
    }

    logger.info({
      msg: `worker ${worker.process.pid} died with code '${code}' and signal '${signal}'. Forking a new one...`,
      pId: worker.process.pid,
      at: new Date(),
    });

    cluster.fork();
  };
};

export default handleWorkerExit;

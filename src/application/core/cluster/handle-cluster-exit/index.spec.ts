import { Cluster, Worker } from 'cluster';
import handleClusterExit from '.';
import ILogger from '../../../observability/logger';

describe('handleWorkerExit', () => {
  const fakeForkFn = jest.fn();
  const fakeLoggerInfoFn = jest.fn();

  const cluster = { fork: fakeForkFn } as unknown as Cluster;
  const logger = { info: fakeLoggerInfoFn } as unknown as ILogger;
  const worker = { process: { pid: 1234 } } as Worker;

  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date()));
  afterEach(() => {
    fakeForkFn.mockReset();
    fakeLoggerInfoFn.mockReset();
    jest.useRealTimers();
  });

  it('should do nothing if worker exits with code zero', () => {
    jest.useFakeTimers().setSystemTime(new Date());
    const code = 0;
    const signal = undefined;

    const handler = handleClusterExit({ cluster, logger });
    handler(worker, code, signal);

    expect(fakeLoggerInfoFn).toHaveBeenCalledTimes(1);
    expect(fakeLoggerInfoFn).toHaveBeenCalledWith({
      msg: `worker 1234 exited with code '0'`,
      pId: 1234,
      at: new Date(),
    });
  });

  it('should spawn a new worker if exit code is not zero', () => {
    jest.useFakeTimers().setSystemTime(new Date());
    const code = 1;
    const signal = undefined;

    const handler = handleClusterExit({ cluster, logger });
    handler(worker, code, signal);

    expect(cluster.fork).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith({
      msg: `worker 1234 died with code '1' and signal 'undefined'. Forking a new one...`,
      pId: 1234,
      at: new Date(),
    });
  });
});

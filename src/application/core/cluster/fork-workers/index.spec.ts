import { Cluster } from 'cluster';
import forkWorkers from '.';
import ILogger from '../../../observability/logger';
import testEnv from '../../../config/env/test-env';

const env = testEnv;

describe('forkWorkers', () => {
  it('should fork a new worker for each available CPU', () => {
    const fakeLoggerInfoFn = jest.fn();
    const logger = { info: fakeLoggerInfoFn } as unknown as ILogger;

    const fakeForkFn = jest.fn();
    const fakeOnFn = jest.fn();
    const cluster = { fork: fakeForkFn, on: fakeOnFn } as unknown as Cluster;

    forkWorkers({ env, logger, cluster });

    expect(logger.info).toHaveBeenNthCalledWith(1, {
      msg: `Number of available CPUs is ${env.AVAILABLE_CPUs}`,
    });

    expect(logger.info).toHaveBeenNthCalledWith(2, {
      msg: `Primary replica ${env.PID} is running`,
    });

    expect(fakeOnFn).toHaveBeenCalled();
    expect(fakeForkFn).toHaveBeenCalledTimes(env.AVAILABLE_CPUs);
  });
});

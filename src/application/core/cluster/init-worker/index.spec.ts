import testEnv from '../../../config/env/test-env';
import { Express } from 'express';
import initExpressWebServerWorker from '.';
import ILogger from '../../../observability/logger';

const env = testEnv;

describe('initExpressWebServerWorker', () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date()));
  afterEach(() => jest.useRealTimers());

  it('should start a new express http server', () => {
    const fakeLoggerInfoFn = jest.fn();
    const fakeListenFn = jest.fn();
    const fakeCreateHTTPServerFn = jest.fn().mockReturnValue({ listen: fakeListenFn });

    const fakeExpressApp = {} as unknown as Express;
    const logger = { info: fakeLoggerInfoFn } as unknown as ILogger;

    initExpressWebServerWorker({
      env,
      logger,
      expressApp: fakeExpressApp,
      createHTTPServer: fakeCreateHTTPServerFn,
    });

    expect(fakeListenFn).toHaveBeenCalledWith(env.PORT, expect.any(Function));
    expect(fakeCreateHTTPServerFn).toHaveBeenCalledWith(fakeExpressApp);
    expect(fakeLoggerInfoFn).toHaveBeenCalledWith({
      msg: `Worker ${env.PID} started`,
      pId: env.PID,
      at: new Date(),
    });
  });
});

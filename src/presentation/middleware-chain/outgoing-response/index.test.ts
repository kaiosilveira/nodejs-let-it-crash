import OutgoingResponseMiddleware from '.';

import * as httpVerbs from '../../http/verbs';
import * as httpCodes from '../../http/status-codes';
import FakeExpressFactory from '../../../__mocks__/express/factory';
import FakeLogger from '../../../application/observability/logger/fake';

describe('OutgoingResponseMiddleware', () => {
  it('should log request status on res.finish', () => {
    const next = jest.fn();
    const method = httpVerbs.GET;
    const url = 'http://localhost:3000';
    const req = FakeExpressFactory.createRequest({
      headers: {},
      body: {},
      context: { url, method },
    });

    const res = FakeExpressFactory.createResponse();
    const logger = new FakeLogger();

    const status = httpCodes.OK;
    const data = { ok: 1 };

    const spyOnLogInfo = jest.spyOn(logger, 'info');

    new OutgoingResponseMiddleware({ logger }).hook(req, res, next);
    const receivedResponse = res.status(status).json(data);
    expect(receivedResponse.body).toEqual(data);
    expect(receivedResponse.status).toEqual(status);

    res.emit('finish');

    expect(spyOnLogInfo).toHaveBeenCalledTimes(1);
    expect(spyOnLogInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('GET '),
        durationMs: expect.any(Number),
        status,
        method,
        url,
      })
    );
  });
});

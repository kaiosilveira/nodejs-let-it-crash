import IncomingRequestMiddleware from '.';
import FakeExpressFactory from '../../../__mocks__/express/factory';

const env = {
  NODE_ENV: 'test',
  COMMIT_SHA: 'unknown',
  NODE_VERSION: '16.14.0',
  PID: 93405,
};

describe('IncomingRequestMiddleware', () => {
  it('should create a context for the request with an actionUUID', () => {
    const generatedUUID = 'abc';
    const generateUUID = jest.fn().mockReturnValue(generatedUUID);
    const next = jest.fn();

    const req = FakeExpressFactory.createRequest();
    const res = FakeExpressFactory.createResponse();

    new IncomingRequestMiddleware({ env, generateUUID }).hook(req, res, next);

    expect(req.context?.actionUUID).toEqual(generatedUUID);
    expect(generateUUID).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});

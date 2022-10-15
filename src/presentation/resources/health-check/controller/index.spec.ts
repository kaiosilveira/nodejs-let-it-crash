import HealthCheckController from '.';
import testEnv from '../../../../application/config/env/test-env';
import FakeApplicationState from '../../../../application/state/fake';
import FakeExpressFactory from '../../../../__mocks__/express/factory';

const env = testEnv;

describe('HealthCheckController', () => {
  describe('getHealthState', () => {
    it('should return 503: SERVICE UNAVAILABLE while if the application is not ready', () => {
      const applicationState = new FakeApplicationState();
      jest.spyOn(applicationState, 'isReady').mockReturnValueOnce(false);

      const req = FakeExpressFactory.createRequest();
      const res = FakeExpressFactory.createResponse();

      const spyOnResponseStatus = jest.spyOn(res, 'status');
      const spyOnResponseJSON = jest.spyOn(res, 'json');

      const healthCheckController = new HealthCheckController({ env, applicationState });
      healthCheckController.getHealthState(req, res);

      expect(spyOnResponseStatus).toHaveBeenCalledWith(503);
      expect(spyOnResponseJSON).toHaveBeenCalledWith({ msg: 'Service temporarily unavailable' });
    });

    it('should return 200: OK and general app information if the application is ready', () => {
      const applicationState = new FakeApplicationState();
      jest.spyOn(applicationState, 'isReady').mockReturnValueOnce(true);

      const req = FakeExpressFactory.createRequest();
      const res = FakeExpressFactory.createResponse();
      const spyOnResponseJSON = jest.spyOn(res, 'json');

      const healthCheckController = new HealthCheckController({ env, applicationState });
      healthCheckController.getHealthState(req, res);

      expect(spyOnResponseJSON).toHaveBeenCalledWith({
        ready: true,
        nodeVersion: env.NODE_VERSION,
        commitSHA: env.COMMIT_SHA,
        environment: env.NODE_ENV,
      });
    });
  });
});

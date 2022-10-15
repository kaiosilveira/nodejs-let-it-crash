import TodoController, { MOCKED_TODO_LIST } from '.';
import testEnv from '../../../../application/config/env/test-env';
import FakeLogger from '../../../../application/observability/logger/fake';
import FakeExpressFactory from '../../../../__mocks__/express/factory';

const env = testEnv;
describe('TodoController', () => {
  describe('list', () => {
    beforeEach(() => jest.useFakeTimers().setSystemTime(new Date()));
    afterEach(() => jest.useRealTimers());

    it('should list all existing items in the to-do list', () => {
      const req = FakeExpressFactory.createRequest();
      const res = FakeExpressFactory.createResponse();
      const spyOnResponseJSON = jest.spyOn(res, 'json');
      const todoCtrl = new TodoController({ env, logger: new FakeLogger() });

      todoCtrl.list(req, res);

      expect(spyOnResponseJSON).toHaveBeenCalledTimes(1);
      expect(spyOnResponseJSON).toHaveBeenCalledWith(MOCKED_TODO_LIST);
    });
  });
});

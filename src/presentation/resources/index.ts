import { Router } from 'express';
import { ApplicationEnv } from '../../config/env';
import InMemoryApplicationState from '../application-state/in-memory';
import ILogger from '../../monitoring/logger';
import HealthCheckController from './health-check/controller';
import TodoController from './to-do/controller';

export default class PresentationResourcesManager {
  static configureRouter({
    router,
    logger,
    env,
  }: {
    router: Router;
    logger: ILogger;
    env: ApplicationEnv;
  }) {
    const applicationState = new InMemoryApplicationState();
    const healthCheckCtrl = new HealthCheckController({ applicationState, env });
    const todoCtrl = new TodoController({ logger, env });

    router.get('/health', healthCheckCtrl.getHealthState);
    router.get('/to-dos', todoCtrl.list);

    applicationState.setReady(true);
    return router;
  }
}

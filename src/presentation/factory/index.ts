import Express from 'express';
import Helmet from 'helmet';
import Crypto from 'node:crypto';
import { ApplicationEnv } from '../../application/config/env';
import IncomingRequestMiddleware from '../middleware-chain/incoming-request';
import OutgoingResponseMiddleware from '../middleware-chain/outgoing-response';
import ILogger from '../../application/observability/logger';

import PresentationResourcesManager from '../resources';

export default class ExpressAppFactory {
  static createApp({ env, logger }: { logger: ILogger; env: ApplicationEnv }) {
    const app = Express();

    app.use(Helmet());
    app.use(Express.json());
    app.use(Express.urlencoded({ extended: true }));
    app.use(new IncomingRequestMiddleware({ env, generateUUID: Crypto.randomUUID }).hook);
    app.use(new OutgoingResponseMiddleware({ logger }).hook);
    app.use(
      PresentationResourcesManager.configureRouter({ env, logger, router: Express.Router() })
    );

    return app;
  }
}

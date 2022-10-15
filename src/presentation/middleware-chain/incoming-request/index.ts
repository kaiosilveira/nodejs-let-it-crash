import { Request, Response } from 'express';
import { ApplicationEnv } from '../../../application/config/env';
import ILogger from '../../../application/observability/logger';

export type IncomingRequestMiddlewareProps = {
  logger: ILogger;
  generateUUID: Function;
  env: ApplicationEnv;
};

class IncomingRequestMiddleware {
  private _generateUUID: Function;
  private _env: ApplicationEnv;

  constructor({ generateUUID, env }) {
    this._env = env;
    this._generateUUID = generateUUID;

    this.hook = this.hook.bind(this);
  }

  hook(req: Request, _: Response, next: Function): void {
    const now = new Date();
    const context = {
      actionUUID: this._generateUUID(),
      reqStartedAt: +now,
      at: now,
      method: req.method,
      url: req.url,
      userId: req.headers['x-user-id'],
      pId: this._env.PID,
    };

    req.context = context;
    next();
  }
}

export default IncomingRequestMiddleware;

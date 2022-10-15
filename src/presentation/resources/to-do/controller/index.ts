import { Request, Response } from 'express';
import ILogger from '../../../../monitoring/logger';
import { ApplicationEnv } from '../../../../config/env';

export const MOCKED_TODO_LIST = [
  { id: 1, title: 'Learn k8s', due: new Date() },
  { id: 1, title: 'Learn Kafka', due: new Date() },
];

export default class TodoController {
  private _requestCount: number;
  private _env: ApplicationEnv;
  private readonly _logger: ILogger;

  constructor({ logger, env }: { logger: ILogger; env: ApplicationEnv }) {
    this._logger = logger;
    this._env = env;
    this._requestCount = 0;
    this.list = this.list.bind(this);
  }

  async list(req: Request, res: Response) {
    this._requestCount++;
    if (this._requestCount % 5 === 0 && this._env.PID % 2 === 0) {
      this._logger.error({ msg: 'Mocked error', ...req.context });
      throw new Error('Mocked error');
    } else {
      res.json(MOCKED_TODO_LIST);
    }
  }
}

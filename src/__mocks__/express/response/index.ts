import { Response } from 'express';
import { EventEmitter } from 'stream';

export default class FakeExpressResponse extends EventEmitter {
  private _statusCode: number;

  constructor() {
    super();
    this._statusCode = 200;
  }

  get statusCode() {
    return this._statusCode;
  }

  status(code: number): Response {
    this._statusCode = code;
    return this as unknown as Response;
  }

  json(body: object): any {
    return { status: this._statusCode, body };
  }
}

import { Request, Response } from 'express';
import FakeExpressResponse from '../response';

export default class FakeExpressFactory {
  static createRequest(
    { headers, body, context } = { headers: {}, body: {}, context: {} }
  ): Request {
    return { headers, body, context } as unknown as Request;
  }

  static createResponse(): Response {
    return new FakeExpressResponse() as unknown as Response;
  }
}

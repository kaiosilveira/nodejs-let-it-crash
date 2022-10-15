import ILogger from '.';

export default class FakeLogger implements ILogger {
  child(_: object): ILogger {
    return this;
  }

  info(_: any): void {}
  error(_: any): void {}
}

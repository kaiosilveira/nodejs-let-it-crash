export default interface ILogger {
  info(obj: any): void;
  error(obj: any): void;
  child(config: object): ILogger;
}

export class ConsoleLogger implements ILogger {
  info(obj: any) {
    console.log(JSON.stringify(obj));
  }

  error(obj: any) {
    console.log(JSON.stringify(obj));
  }

  child(_: object): ILogger {
    return this;
  }
}

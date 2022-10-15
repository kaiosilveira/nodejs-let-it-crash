export const MOCKED_TODO_LIST = [
  { id: 1, title: 'Learn k8s', due: new Date() },
  { id: 1, title: 'Learn Kafka', due: new Date() },
];

export default class TodoController {
  private requestCount: number;

  constructor() {
    this.requestCount = 0;
  }

  async list(_, res) {
    this.requestCount++;

    if (this.requestCount % 4 === 0) {
      throw new Error('Mocked error');
    } else {
      res.json(MOCKED_TODO_LIST);
    }
  }
}

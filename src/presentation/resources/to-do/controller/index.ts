export const MOCKED_TODO_LIST = [
  { id: 1, title: 'Learn k8s', due: new Date() },
  { id: 1, title: 'Learn Kafka', due: new Date() },
];

export default class TodoController {
  async list(_, res) {
    res.json(MOCKED_TODO_LIST);
  }
}

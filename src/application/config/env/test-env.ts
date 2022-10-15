import { ApplicationEnv } from '.';

const NODE_VERSION = '16.14.0';
const COMMIT_SHA = 'cf221f9a162cf80a67f1237318cf5193b9cdce83';
const NODE_ENV = 'test';

const testEnv = {
  NODE_ENV,
  COMMIT_SHA,
  NODE_VERSION,
  PID: 93405,
  AVAILABLE_CPUs: 4,
  PORT: 3000,
} as ApplicationEnv;

export default testEnv;

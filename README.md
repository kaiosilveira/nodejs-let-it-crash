[![Continuous Integration](https://github.com/kaiosilveira/nodejs-fail-fast/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/nodejs-fail-fast/actions/workflows/ci.yml)

# nodejs + ts + express template

Simple backend application built using Typescript and Express on top of NodeJS.

Log data:

| Message                                                                 | Status Code | Date                     | Process ID |
| ----------------------------------------------------------------------- | ----------- | ------------------------ | ---------- |
| GET /to-dos 200 (0ms)                                                   | 200         | 2022-10-14T12:23:04.742Z | 50553      |
| GET /to-dos 200 (1ms)                                                   | 200         | 2022-10-14T12:23:04.996Z | 50421      |
| A Fatal error has occurred                                              | -           | 2022-10-14T12:23:05.248Z | 50556      |
| worker 50556 died with code '1' and signal 'null'. Forking a new one... | -           | 2022-10-14T12:23:05.262Z | 50556      |
| GET /to-dos 200 (0ms)                                                   | 200         | 2022-10-14T12:23:05.492Z | 50423      |
| GET /to-dos 200 (1ms)                                                   | 200         | 2022-10-14T12:23:05.743Z | 50557      |
| GET /to-dos 200 (0ms)                                                   | 200         | 2022-10-14T12:23:05.992Z | 50427      |
| GET /to-dos 200 (0ms)                                                   | 200         | 2022-10-14T12:23:06.242Z | 50549      |
| GET /to-dos 200 (1ms)                                                   | 200         | 2022-10-14T12:23:06.497Z | 50425      |
| GET /to-dos 200 (1ms)                                                   | 200         | 2022-10-14T12:23:06.742Z | 50553      |
| GET /to-dos 200 (1ms)                                                   | 200         | 2022-10-14T12:23:06.995Z | 50421      |
| Worker 50595 started                                                    | -           | 2022-10-14T12:23:07.028Z | 50595      |
| worker 50595 listening at 3000 🚀                                       | -           | 2022-10-14T12:23:07.041Z | 50595      |

Re-spawn:
| Message                                                                 | Status Code | Date                     | Process ID |
| ----------------------------------------------------------------------- | ----------- | ------------------------ | ---------- |
| A Fatal error has occurred                                              | -           | 2022-10-14T12:23:05.248Z | 50556      |
| worker 50556 died with code '1' and signal 'null'. Forking a new one... | -           | 2022-10-14T12:23:05.262Z | 50556      |
| Worker 50595 started                                                    | -           | 2022-10-14T12:23:07.028Z | 50595      |
| worker 50595 listening at 3000 🚀                                       | -           | 2022-10-14T12:23:07.041Z | 50595      |

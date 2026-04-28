import pino from 'pino';
import { env, isProd } from './env';

export const logger = pino({
  level: isProd ? 'info' : 'debug',
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      },
  base: { service: 'velvettray-api', env: env.NODE_ENV },
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
});

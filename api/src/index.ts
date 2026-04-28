import http from 'http';
import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';
import { initRealtime } from './services/realtime.service';

async function start() {
  await connectDB();
  const app = createApp();
  const server = http.createServer(app);
  initRealtime(server);

  server.listen(env.PORT, () => {
    logger.info(`▲ Velvet Tray API ready at ${env.API_URL}`);
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down…');
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => logger.error({ reason }, 'unhandledRejection'));
  process.on('uncaughtException', (err) => logger.fatal({ err }, 'uncaughtException'));
}

void start();

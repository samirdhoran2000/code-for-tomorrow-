import { createApp } from './app';
import { env } from './config/env';
import { pool } from './db/pool';

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`Chat backend listening on port ${env.PORT}`);
});

const shutdown = (signal: string): void => {
  console.log(`${signal} received, shutting down`);
  server.close(() => {
    void pool.end().finally(() => process.exit(0));
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

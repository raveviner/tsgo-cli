/* eslint-disable no-console */
import 'dotenv/config';
import { createApp } from './app.js';

const start = async (): Promise<void> => {
  try {
    const app = await createApp({ logger: true });
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });

    app.log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Handle graceful shutdown
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.on(signal, async () => {
        console.info(`\n${signal} received. Shutting down gracefully...`);
        await app.close();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();

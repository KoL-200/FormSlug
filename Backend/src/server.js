require('dotenv').config();
const app = require('./app');
const { connectDatabase, prisma } = require('./config/database.Config');
const { startWebhookRetrySweep } = require('./services/webhookServices/webhookDelivery.Services');
const env = require('./config/env.Config');
const logger = require('./config/logger');

let server;
let shuttingDown = false;

const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info({ signal }, 'Shutdown signal received');

    const forceExitTimer = setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10_000);

    server.close(async (error) => {
        if (error) {
            logger.error({ err: error }, 'Error closing HTTP server');
        } else {
            logger.info('HTTP server closed');
        }

        try {
            await prisma.$disconnect();
            logger.info('Database disconnected');
            clearTimeout(forceExitTimer);
            process.exit(error ? 1 : 0);
        } catch (disconnectError) {
            logger.error({ err: disconnectError }, 'Failed to disconnect database');
            process.exit(1);
        }
    });
};

const startServer = async () => {
    try {
        await connectDatabase();
        startWebhookRetrySweep();
        server = app.listen(env.PORT, () => {
            logger.info({ port: env.PORT }, 'Server started');
        });
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        logger.error({ err: error }, 'Failed to start server');
        process.exit(1);
    }
};

startServer();
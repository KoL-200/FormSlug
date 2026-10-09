const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database.Config');
const { redis } = require('../lib/rateLimiter');
const logger = require('../config/logger');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API and dependency health
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: API, database, and Redis are healthy
 *       503:
 *         description: One or more dependencies are degraded
 */
router.get('/health', async (req, res) => {
    const checks = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            database: 'unknown',
            redis: 'unknown',
        },
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        checks.services.database = 'ok';
    } catch (err) {
        checks.status = 'degraded';
        checks.services.database = 'error';
        logger.error({ err }, 'health check: database unreachable');
    }

    try {
        await redis.ping();
        checks.services.redis = 'ok';
    } catch (err) {
        checks.status = 'degraded';
        checks.services.redis = 'error';
        logger.error({ err }, 'health check: Redis unreachable');
    }

    const statusCode = checks.services.database === 'ok' ? 200 : 503;
    res.status(statusCode).json(checks);
});

module.exports = router;
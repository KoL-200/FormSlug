const { Prisma } = require('@prisma/client');
const { AppError } = require('../utils/AppError');
const logger = require('../config/logger');

function errorHandler(err, req, res, next) {
    const log = req.log || logger;

    if (err instanceof AppError) {
        log.warn({ err, requestId: req.requestId }, 'operational error');
        return res.status(err.statusCode).json({ error: err.message });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            log.warn({ err, requestId: req.requestId }, 'database conflict');
            return res.status(409).json({
                error: `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists`,
            });
        }
        if (err.code === 'P2025') {
            log.warn({ err, requestId: req.requestId }, 'database record not found');
            return res.status(404).json({
                error: 'Resource not found',
            });
        }
    }

    log.error({ err, requestId: req.requestId }, 'unhandled error');
    return res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = errorHandler;
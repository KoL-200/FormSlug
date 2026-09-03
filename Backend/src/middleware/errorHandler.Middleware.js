const { Prisma } = require('@prisma/client');
const { AppError } = require('../utils/AppError');
const logger = require('../config/logger');

function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists`,
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                error: 'Resource not found',
            });
        }
    }

    logger.error({ err }, 'Unhandled error occurred');
    return res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = errorHandler;
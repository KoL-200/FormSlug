const { randomUUID } = require('crypto');
const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
    req.requestId = randomUUID();
    const originalUrl = req.originalUrl;
    req.log = logger.child({ requestId: req.requestId });

    req.log.info({
        method: req.method,
        url: originalUrl,
        ip: req.ip,
    }, 'incoming request');

    const start = Date.now();
    res.on('finish', () => {
        req.log.info({
            method: req.method,
            url: originalUrl,
            statusCode: res.statusCode,
            duration: `${Date.now() - start}ms`,
        }, 'request completed');
    });

    next();
};

module.exports = requestLogger;
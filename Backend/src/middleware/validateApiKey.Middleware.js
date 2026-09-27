const { ForbiddenError } = require('../utils/AppError');

const validateApiKey = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next();
    }

    if (!authHeader.startsWith('Bearer ')) {
        return next(new ForbiddenError('Invalid authorization format'));
    }

    const providedKey = authHeader.split(' ')[1];

    if (!req.form) {
        return next(new ForbiddenError('Form not resolved before key validation'));
    }

    if (providedKey !== req.form.api_key) {
        return next(new ForbiddenError('Invalid API key'));
    }

    next();
};

module.exports = validateApiKey;
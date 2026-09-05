const jwt = require('jsonwebtoken');

const env = require('../config/env.Config');
const { UnauthorizedError } = require('../utils/AppError');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnauthorizedError('No token provided'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
        req.user = { id: payload.userId };
        next();
    } catch (err) {
        return next(new UnauthorizedError('Invalid token'));
    }
};

module.exports = authenticate;
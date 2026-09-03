const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const env = require('../config/env.Config');

function signToken(payload, secret, expiresIn) {
    return jwt.sign(payload, secret, { expiresIn });
}

function signAccessToken(user) {
    return signToken(
        { userId: user.id },
        env.JWT_ACCESS_SECRET,
        env.JWT_ACCESS_EXPIRATION
    );
}

function signRefreshToken(user) {
    return signToken(
        { userId: user.id, jti: crypto.randomUUID() },
        env.JWT_REFRESH_SECRET,
        env.JWT_REFRESH_EXPIRATION
    );
}

module.exports = {
    signAccessToken,
    signRefreshToken,
};
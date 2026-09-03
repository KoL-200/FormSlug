const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
    if (typeof password !== 'string' || password.length === 0) {
        throw new Error('Password must be a non-empty string');
    }

    return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hashedPassword) {
    if (typeof password !== 'string' || typeof hashedPassword !== 'string') {
        return false;
    }

    return bcrypt.compare(password, hashedPassword);
}

function hashToken(rawToken) {
    if (typeof rawToken !== 'string' || rawToken.length === 0) {
        throw new Error('Token must be a non-empty string');
    }

    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function findMatchingToken(rawToken, hashes) {
    if (!Array.isArray(hashes)) {
        return null;
    }

    const rawHash = hashToken(rawToken);
    return hashes.find((h) => typeof h === 'string' && h === rawHash) ?? null;
}

module.exports = {
    hashPassword,
    comparePassword,
    hashToken,
    findMatchingToken,
};
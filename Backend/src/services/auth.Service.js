const { hashPassword, comparePassword, hashToken, findMatchingToken } = require('../utils/hashing');
const { prisma } = require('../config/database.Config');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { parseDuration } = require('../utils/duration');
const { UnauthorizedError } = require('../utils/AppError');
const env = require('../config/env.Config');
const jwt = require('jsonwebtoken');

function findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
}

function findUserById(id) {
    return prisma.user.findUnique({ where: { id } });
}

function createUser({ email, password_hash, name }) {
    return prisma.user.create({ data: { email, password_hash, name } });
}

function createRefreshToken({ userId, token_hash, expires_at }) {
    return prisma.refreshToken.create({
        data: { user_id: userId, token_hash, expires_at },
    });
}

function findRefreshTokenByUserId(userId) {
    return prisma.refreshToken.findMany(
        {
            where: {
                user_id: userId,
                revoked_at: null,
                expires_at: { gt: new Date() },
            }
        }
    )
}

function findRevokedRefreshTokensByUserId(userId) {
    return prisma.refreshToken.findMany(
        {
            where: {
                user_id: userId,
                revoked_at: {
                    not: null
                }
            }
        }
    );
}

function revokeAllUserRefreshTokens(userId) {
    return prisma.refreshToken.updateMany(
        {
            where: {
                user_id: userId,
                revoked_at: null
            },
            data: {
                revoked_at: new Date()
            }
        }
    )
}

function revokeRefreshToken(tokenId) {
    return prisma.refreshToken.update(
        {
            where: {
                id: tokenId
            },
            data: {
                revoked_at: new Date()
            }
        }
    )
}

const createNewUser = async ({ email, password, name }) => {
    const hashedPassword = await hashPassword(password);
    const newUser = await createUser({ email, password_hash: hashedPassword, name });
    const { password_hash: _removed, ...safeUser } = newUser;
    return safeUser;
};

const loginUser = async ({ email, password }) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const refreshTokenHash = hashToken(refreshToken);
    const refreshLifetimeMs = parseDuration(env.JWT_REFRESH_EXPIRATION);
    const expiresAt = new Date(Date.now() + refreshLifetimeMs);

    await createRefreshToken({
        userId: user.id,
        token_hash: refreshTokenHash,
        expires_at: expiresAt,
    });

    const { password_hash: _removed, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken };
};

const refreshTokens = async (rawRefreshToken) => {
    let payload
    try {
        payload = jwt.verify(rawRefreshToken, env.JWT_REFRESH_SECRET)
    } catch (err) {
        throw new UnauthorizedError('Invalid refresh token')
    }

    const activeUserRefreshToken = await findRefreshTokenByUserId(payload.userId)
    const matchedHash = findMatchingToken(rawRefreshToken, activeUserRefreshToken.map((c) => c.token_hash))
    const matchedToken = activeUserRefreshToken.find((c) => c.token_hash === matchedHash)

    if (!matchedToken) {
        const revokedUser = await findRevokedRefreshTokensByUserId(payload.userId)
        const reusedHash = findMatchingToken(rawRefreshToken, revokedUser.map((c) => c.token_hash))
        if (reusedHash) {
            await revokeAllUserRefreshTokens(payload.userId)
        }
        throw new UnauthorizedError('Invalid refresh token')
    }

    await revokeRefreshToken(matchedToken.id)

    const user = await findUserById(payload.userId);
    if (!user) {
        throw new UnauthorizedError('Invalid refresh token');
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    const newHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRATION));

    await createRefreshToken({
        userId: user.id,
        token_hash: newHash,
        expires_at: expiresAt,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

const logoutUser = async (rawRefreshToken) => {
    if (!rawRefreshToken) return

    let payload
    try {
        payload = jwt.verify(rawRefreshToken, env.JWT_REFRESH_SECRET)
    } catch (err) {
        return
    }

    const activeUserRefreshToken = await findRefreshTokenByUserId(payload.userId)
    const matchedHash = findMatchingToken(rawRefreshToken, activeUserRefreshToken.map((c) => c.token_hash))
    const matchedToken = activeUserRefreshToken.find((c) => c.token_hash === matchedHash)

    if (matchedToken) {
        return revokeRefreshToken(matchedToken.id)
    }
}

module.exports = {
    createNewUser,
    loginUser,
    refreshTokens,
    logoutUser
};
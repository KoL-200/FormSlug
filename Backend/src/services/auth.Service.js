const { hashPassword, comparePassword, hashToken } = require('../utils/hashing');
const { prisma } = require('../config/database.Config');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { parseDuration } = require('../utils/duration');
const { ConflictError, UnauthorizedError } = require('../utils/AppError');
const env = require('../config/env.Config');

function findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
}

function createUser({ email, password_hash, name }) {
    return prisma.user.create({ data: { email, password_hash, name } });
}

function createRefreshToken({ userId, token_hash, expires_at }) {
    return prisma.refreshToken.create({
        data: { user_id: userId, token_hash, expires_at },
    });
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

module.exports = { createNewUser, loginUser };
const env = require('../config/env.Config');
const { parseDuration } = require('../utils/duration');
const { loginUser } = require('../services/auth.Service');

const login = async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginUser({ email, password });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseDuration(env.JWT_REFRESH_EXPIRATION),
        path: '/auth/refresh',
    });

    res.status(200).json({
        success: true,
        data: { accessToken, user },
    });
};

module.exports = { login };
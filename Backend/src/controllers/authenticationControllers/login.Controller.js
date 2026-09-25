const env = require('../../config/env.Config');
const { parseDuration } = require('../../utils/duration');
const { loginUser } = require('../../services/authenticationServices/auth.Service');
const { writeAuditLog } = require('../../utils/auditLog');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await loginUser({ email, password });

        await writeAuditLog({
            userId: user.id,
            action: 'auth.login.success',
            metadata: { email: user.email },
            ipAddress: req.ip,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: parseDuration(env.JWT_REFRESH_EXPIRATION),
            path: '/api/v1/auth/refresh',
        });

        res.status(200).json({
            success: true,
            data: { accessToken, user },
        });
    } catch (err) {
        if (err.statusCode === 401) {
            await writeAuditLog({
                userId: null,
                action: 'auth.login.failed',
                metadata: { email: req.body.email },
                ipAddress: req.ip,
            });
        }
        throw err;
    }
};

module.exports = { login };

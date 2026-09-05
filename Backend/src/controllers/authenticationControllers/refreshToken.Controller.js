const { refreshTokens } = require('../../services/authenticationServices/auth.Service')
const env = require('../../config/env.Config')
const { parseDuration } = require('../../utils/duration')

const refreshAccessTokenController = async (req, res) => {
    const refreshToken = req.cookies.refreshToken

    const { accessToken, refreshToken: newRefreshToken } = await refreshTokens(refreshToken)

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseDuration(env.JWT_REFRESH_EXPIRATION),
        path: '/api/v1/auth/refresh',
    })

    res.status(200).json({ success: true, data: { accessToken } })
}

module.exports = {
    refreshAccessTokenController
}

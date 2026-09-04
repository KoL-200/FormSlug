const { logoutUser } = require('../services/auth.Service')
const env = require('../config/env.Config')

const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    await logoutUser(refreshToken)

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth/refresh',
    })

    res.status(200).json({ success: true, message: 'Logged out successfully' })
}

module.exports = { logout }
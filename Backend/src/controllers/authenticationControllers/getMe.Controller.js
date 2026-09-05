const { getMe } = require('../../services/authenticationServices/auth.Service')

const getUser = async (req, res) => {
    const userId = req.user.id
    const me = await getMe(userId)
    res.status(200).json({ success: true, data: me })
}

module.exports = { getUser }

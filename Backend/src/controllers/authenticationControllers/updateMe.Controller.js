const { updateMe } = require('../../services/authenticationServices/auth.Service')

const updateUser = async (req, res) => {
    const userId = req.user.id
    const { name } = req.body
    const me = await updateMe(userId, { name })

    res.status(200).json({ success: true, data: me })
}

module.exports = { updateUser }

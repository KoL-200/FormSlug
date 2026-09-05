const { updatePassword } = require('../../services/authenticationServices/auth.Service')

const updateUserPassword = async (req, res) => {
    const userId = req.user.id
    const { currentPassword, newPassword } = req.body
    await updatePassword(userId, { currentPassword, newPassword })

    res.status(200).json({ success: true, message: 'Password updated successfully' })
}

module.exports = { updateUserPassword }

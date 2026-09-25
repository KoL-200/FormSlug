const { updatePassword } = require('../../services/authenticationServices/auth.Service')
const { writeAuditLog } = require('../../utils/auditLog');

const updateUserPassword = async (req, res) => {
    const userId = req.user.id
    const { currentPassword, newPassword } = req.body

    await updatePassword(userId, { currentPassword, newPassword })

    await writeAuditLog({
        userId,
        action: 'auth.password.changed',
        metadata: {},
        ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' })
}

module.exports = { updateUserPassword }

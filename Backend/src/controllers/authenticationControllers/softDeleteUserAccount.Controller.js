const { softDeleteUser } = require('../../services/authenticationServices/auth.Service')
const { writeAuditLog } = require('../../utils/auditLog');

const deleteAccountController = async (req, res) => {
    const userId = req.user.id;

    await softDeleteUser(userId);

    await writeAuditLog({
        userId,
        action: 'user.account.deleted',
        metadata: { grace_period_days: 30 },
        ipAddress: req.ip,
    });

    res.status(200).json({
        success: true,
        message: 'Account scheduled for deletion. You have 30 days to contact support if this was a mistake.',
    });
};

module.exports = { deleteAccountController };
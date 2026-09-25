const { createNewUser } = require('../../services/authenticationServices/auth.Service');
const { writeAuditLog } = require('../../utils/auditLog');

const registerUser = async (req, res) => {
    const { email, password, name } = req.body;
    const newUser = await createNewUser({ email, password, name });

    await writeAuditLog({
        userId: newUser.id,
        action: 'auth.register',
        metadata: { email: newUser.email },
        ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: newUser });
};

module.exports = { registerUser };

const { createNewUser } = require('../../services/authenticationServices/auth.Service');

const registerUser = async (req, res) => {
    const { email, password, name } = req.body;
    const newUser = await createNewUser({ email, password, name });
    res.status(201).json({ success: true, data: newUser });
};

module.exports = { registerUser };

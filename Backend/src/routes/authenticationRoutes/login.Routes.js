const express = require('express');
const router = express.Router();

const validate = require('../../middleware/validate.Middleware');
const { loginSchema } = require('../../validators/auth.Validator');
const { login } = require('../../controllers/authenticationControllers/login.Controller');
const { refreshAccessTokenController } = require('../../controllers/authenticationControllers/refreshToken.Controller');

router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshAccessTokenController);

module.exports = router;
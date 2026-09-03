const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate.Middleware');
const { registerSchema } = require('../validators/auth.Validator');
const { registerUser } = require('../controllers/register.Controller');

router.post('/register', validate(registerSchema), registerUser);

module.exports = router;
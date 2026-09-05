const express = require('express');
const router = express.Router();

const { updateUser } = require('../../controllers/authenticationControllers/updateMe.Controller')
const { updateUserPassword } = require('../../controllers/authenticationControllers/updateUserPassword.Controller')
const authenticate = require('../../middleware/authenicate.Middleware')
const { updateSchema, updatePasswordSchema } = require('../../validators/auth.Validator')
const validate = require('../../middleware/validate.Middleware')

router.patch('/users/me', authenticate, validate(updateSchema), updateUser)
router.patch('/users/me/password', authenticate, validate(updatePasswordSchema), updateUserPassword)

module.exports = router
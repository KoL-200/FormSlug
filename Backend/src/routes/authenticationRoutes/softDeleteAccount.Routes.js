const express = require('express');
const router = express.Router();

const { deleteAccountController } = require('../../controllers/authenticationControllers/softDeleteUserAccount.Controller.js');
const authenticate = require('../../middleware/authenicate.Middleware')

router.delete('/users/me', authenticate, deleteAccountController)

module.exports = router
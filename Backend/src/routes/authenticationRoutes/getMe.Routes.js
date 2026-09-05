const express = require('express');
const router = express.Router();

const { getUser } = require('../../controllers/authenticationControllers/getMe.Controller')

const authenticate = require('../../middleware/authenicate.Middleware')

router.get('/users/me', authenticate, getUser)

module.exports = router
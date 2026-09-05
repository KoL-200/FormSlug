const express = require('express');
const healthRoutes = require('./authentication/health.Routes');
const registerRoutes = require('./register.Routes');
const loginRoutes = require('./authentication/login.Routes');
const logoutRoutes = require('./authentication/logout.Routes');
const getMeRoutes = require('./authentication/getMe.Routes');
const updateMeRoutes = require('./authentication/updateMe.Routes');

const router = express.Router();

router.use('/', healthRoutes);
router.use('/auth', registerRoutes);
router.use('/auth', loginRoutes);
router.use('/auth', logoutRoutes);
router.use('/', getMeRoutes);
router.use('/', updateMeRoutes);

module.exports = router;
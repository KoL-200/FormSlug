const express = require('express');
const healthRoutes = require('./authenticationRoutes/health.Routes');
const registerRoutes = require('./authenticationRoutes/register.Routes');
const loginRoutes = require('./authenticationRoutes/login.Routes');
const logoutRoutes = require('./authenticationRoutes/logout.Routes');
const getMeRoutes = require('./authenticationRoutes/getMe.Routes');
const updateMeRoutes = require('./authenticationRoutes/updateMe.Routes');

const router = express.Router();

router.use('/', healthRoutes);
router.use('/auth', registerRoutes);
router.use('/auth', loginRoutes);
router.use('/auth', logoutRoutes);
router.use('/', getMeRoutes);
router.use('/', updateMeRoutes);

module.exports = router;
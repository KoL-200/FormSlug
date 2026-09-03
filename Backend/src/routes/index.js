const express = require('express');
const healthRoutes = require('./health.Routes');
const registerRoutes = require('./register.Routes');
const loginRoutes = require('./login.Routes');

const router = express.Router();

router.use('/', healthRoutes);
router.use('/auth', registerRoutes);
router.use('/auth', loginRoutes);

module.exports = router;
const express = require('express');
const healthRoutes = require('./authenticationRoutes/health.Routes');

// Authentication Routes
const registerRoutes = require('./authenticationRoutes/register.Routes');
const loginRoutes = require('./authenticationRoutes/login.Routes');
const logoutRoutes = require('./authenticationRoutes/logout.Routes');
const getMeRoutes = require('./authenticationRoutes/getMe.Routes');
const updateMeRoutes = require('./authenticationRoutes/updateMe.Routes');

// Project Routes
const createProjectRoutes = require('./projectRoutes/createProject.Routes')
const getProjectsRoutes = require('./projectRoutes/getProjects.Routes')
const createFormRoutes = require('./projectRoutes/createForm.Routes')


const router = express.Router();

router.use('/', healthRoutes);

// Authentication
router.use('/auth', registerRoutes);
router.use('/auth', loginRoutes);
router.use('/auth', logoutRoutes);
router.use('/', getMeRoutes);
router.use('/', updateMeRoutes);

// Project
router.use('/', createProjectRoutes)
router.use('/', getProjectsRoutes)
router.use('/', createFormRoutes);

module.exports = router;
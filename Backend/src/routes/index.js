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
const updateProjectRoutes = require('./projectRoutes/updateProject.Routes')
const deleteProjectRoutes = require('./projectRoutes/deleteProject.Routes')
const createFormRoutes = require('./projectRoutes/createForm.Routes')
const updateFormRoutes = require('./projectRoutes/updateForm.Routes')
const deleteFormRoutes = require('./projectRoutes/deleteForm.Routes')
const activeFormBySlugRoutes = require('./projectRoutes/activeFormBySlug.Routes')
const listSubmissionsRoutes = require('./projectRoutes/listSubmissions.Routes')


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
router.use('/', updateProjectRoutes)
router.use('/', deleteProjectRoutes)
router.use('/', createFormRoutes);
router.use('/', updateFormRoutes);
router.use('/', deleteFormRoutes);
router.use('/', activeFormBySlugRoutes);
router.use('/', listSubmissionsRoutes);

module.exports = router;
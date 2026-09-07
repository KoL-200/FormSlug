const express = require('express');
const authenticate = require('../../middleware/authenicate.Middleware');
const { getProjectsController } = require('../../controllers/projectControllers/project.Controllers');

const router = express.Router();

router.get('/projects', authenticate, getProjectsController);

module.exports = router;
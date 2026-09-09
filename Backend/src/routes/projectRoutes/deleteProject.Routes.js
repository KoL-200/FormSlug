const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const { deleteProjectController } = require('../../controllers/projectControllers/project.Controllers');

router.delete('/projects/:projectId', authenticate, ownsProject, deleteProjectController);

module.exports = router;
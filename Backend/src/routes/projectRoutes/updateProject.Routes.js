const express = require('express');
const router = express.Router();

const { updateProjectSchema } = require('../../validators/projectSchema/project.Validator')
const validate = require('../../middleware/validate.Middleware');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const { updateProjectController } = require('../../controllers/projectControllers/project.Controllers');

router.patch('/projects/:projectId', authenticate, ownsProject, validate(updateProjectSchema), updateProjectController)

module.exports = router
const express = require('express');
const router = express.Router();

const { createProjectSchema } = require('../../validators/projectSchema/project.Validator')
const validate = require('../../middleware/validate.Middleware');
const authenticate = require('../../middleware/authenicate.Middleware');
const { createProjectController } = require('../../controllers/projectControllers/project.Controllers');

router.post('/projects', authenticate, validate(createProjectSchema), createProjectController)

module.exports = router
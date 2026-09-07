const express = require('express');
const router = express.Router();

const { createFormController, getFormsController } = require('../../controllers/projectControllers/form.Controllers');
const { createFormSchema } = require('../../validators/projectSchema/form.Validator');

const validate = require('../../middleware/validate.Middleware');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');

router.post('/projects/:projectId/forms', authenticate, ownsProject, validate(createFormSchema), createFormController);
router.get('/projects/:projectId/forms', authenticate, ownsProject, getFormsController);

module.exports = router;
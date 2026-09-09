const express = require('express');
const router = express.Router();

const { updateFormController } = require('../../controllers/projectControllers/form.Controllers');
const { updateFormSchema } = require('../../validators/projectSchema/form.Validator');
const validate = require('../../middleware/validate.Middleware');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');

router.patch(
    '/projects/:projectId/forms/:formId',
    authenticate,
    ownsProject,
    ownsForm,
    validate(updateFormSchema),
    updateFormController,
);

module.exports = router;
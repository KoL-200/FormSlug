const express = require('express');
const router = express.Router();

const { updateFormController } = require('../../controllers/projectControllers/form.Controllers');
const { updateFormSchema } = require('../../validators/projectSchema/form.Validator');
const validate = require('../../middleware/validate.Middleware');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');
const { rotateApiKeyController } = require('../../controllers/projectControllers/rotateApikey.Controller')

router.post(
    '/projects/:projectId/forms/:formId/rotate-key',
    authenticate,
    ownsProject,
    ownsForm,
    rotateApiKeyController
);

router.patch(
    '/projects/:projectId/forms/:formId',
    authenticate,
    ownsProject,
    ownsForm,
    validate(updateFormSchema),
    updateFormController,
);

module.exports = router;
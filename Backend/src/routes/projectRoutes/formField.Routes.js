const express = require('express');
const router = express.Router();

const { createFieldController } = require('../../controllers/projectControllers/formField.Controllers');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');
const validate = require('../../middleware/validate.Middleware');
const { createFieldSchema } = require('../../validators/FormFieldSchema/createField');

router.post(
    '/projects/:projectId/forms/:formId/fields',
    authenticate,
    ownsProject,
    ownsForm,
    validate(createFieldSchema),
    createFieldController,
);

module.exports = router;

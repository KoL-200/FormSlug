const express = require('express');
const router = express.Router();

const {
    createFieldController,
    listFieldsController,
    updateFieldController,
    deleteFieldController,
    reorderFieldsController,
} = require('../../controllers/projectControllers/formField.Controllers');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');
const validate = require('../../middleware/validate.Middleware');
const { createFieldSchema } = require('../../validators/FormFieldSchema/createField');
const { updateFieldSchema, reorderFieldsSchema } = require('../../validators/FormFieldSchema/updateField');

router.get(
    '/projects/:projectId/forms/:formId/fields',
    authenticate,
    ownsProject,
    ownsForm,
    listFieldsController,
);

router.post(
    '/projects/:projectId/forms/:formId/fields',
    authenticate,
    ownsProject,
    ownsForm,
    validate(createFieldSchema),
    createFieldController,
);

router.patch(
    '/projects/:projectId/forms/:formId/fields/reorder',
    authenticate,
    ownsProject,
    ownsForm,
    validate(reorderFieldsSchema),
    reorderFieldsController,
);

router.patch(
    '/projects/:projectId/forms/:formId/fields/:fieldId',
    authenticate,
    ownsProject,
    ownsForm,
    validate(updateFieldSchema),
    updateFieldController,
);

router.delete(
    '/projects/:projectId/forms/:formId/fields/:fieldId',
    authenticate,
    ownsProject,
    ownsForm,
    deleteFieldController,
);

module.exports = router;

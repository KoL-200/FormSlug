const express = require('express');
const router = express.Router();

const { deleteFormController } = require('../../controllers/projectControllers/form.Controllers');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');

router.delete(
    '/projects/:projectId/forms/:formId',
    authenticate,
    ownsProject,
    ownsForm,
    deleteFormController,
);

module.exports = router;
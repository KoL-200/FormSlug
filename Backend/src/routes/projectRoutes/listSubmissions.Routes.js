const express = require('express');
const router = express.Router();

const { listSubmissionsController } = require('../../controllers/projectControllers/submission.Controller');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');

router.get(
    '/projects/:projectId/forms/:formId/submissions',
    authenticate,
    ownsProject,
    ownsForm,
    listSubmissionsController,
);

module.exports = router;
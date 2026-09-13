const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');

const { restoreSubmissionController } = require('../../controllers/projectControllers/submission.Controller');

router.post('/projects/:projectId/forms/:formId/submissions/:id/restore',
    authenticate,
    ownsProject,
    ownsForm,
    restoreSubmissionController)

module.exports = router
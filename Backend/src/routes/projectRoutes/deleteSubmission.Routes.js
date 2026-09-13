const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');

const { deleteSubmissionController } = require('../../controllers/projectControllers/submission.Controller');

router.delete('/projects/:projectId/forms/:formId/submissions/:id',
    authenticate,
    ownsProject,
    ownsForm,
    deleteSubmissionController)

module.exports = router
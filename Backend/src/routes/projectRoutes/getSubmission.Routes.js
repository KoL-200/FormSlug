const express = require('express');
const router = express.Router();

const { getSubmissionByIdController } = require('../../controllers/projectControllers/submission.Controller');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');

router.get('/projects/:projectId/forms/:formId/submissions/:id',
    authenticate,
    ownsProject,
    ownsForm,
    getSubmissionByIdController)

module.exports = router
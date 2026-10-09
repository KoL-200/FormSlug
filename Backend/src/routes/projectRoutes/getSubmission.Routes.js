const express = require('express');
const router = express.Router();

const { getSubmissionByIdController } = require('../../controllers/projectControllers/submission.Controller');
const { exportSubmissionsController } = require('../../controllers/projectControllers/exportSubmission.Controller')
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');

/**
 * @swagger
 * /projects/{projectId}/forms/{formId}/submissions/export:
 *   get:
 *     summary: Export form submissions as CSV
 *     tags: [Submissions]
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: formId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: includeDeleted
 *         in: query
 *         description: Set true to include soft-deleted submissions
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: CSV file containing submission ID, submitted time, IP address, and data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
    '/projects/:projectId/forms/:formId/submissions/export',
    authenticate,
    ownsProject,
    ownsForm,
    exportSubmissionsController
);

/**
 * @swagger
 * /projects/{projectId}/forms/{formId}/submissions/{id}:
 *   get:
 *     summary: Get a submission
 *     tags: [Submissions]
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: formId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Submission details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessSubmission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/projects/:projectId/forms/:formId/submissions/:id',
    authenticate,
    ownsProject,
    ownsForm,
    getSubmissionByIdController)

module.exports = router
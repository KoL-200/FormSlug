const express = require('express');
const router = express.Router();

const { listSubmissionsController } = require('../../controllers/projectControllers/submission.Controller');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');

/**
 * @swagger
 * /projects/{projectId}/forms/{formId}/submissions:
 *   get:
 *     summary: List form submissions
 *     description: Returns non-deleted submissions newest first. Page is at least 1 and limit is clamped to 1-100.
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
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: includeDeleted
 *         in: query
 *         description: Set true to include soft-deleted submissions
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: from
 *         in: query
 *         description: Inclusive creation-time lower bound
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: to
 *         in: query
 *         description: Inclusive creation-time upper bound
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Submission page and pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessSubmissionList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
    '/projects/:projectId/forms/:formId/submissions',
    authenticate,
    ownsProject,
    ownsForm,
    listSubmissionsController,
);

module.exports = router;
const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');

const { restoreSubmissionController } = require('../../controllers/projectControllers/submission.Controller');

/**
 * @swagger
 * /projects/{projectId}/forms/{formId}/submissions/{id}/restore:
 *   post:
 *     summary: Restore a soft-deleted submission
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
 *         description: Submission restored
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/projects/:projectId/forms/:formId/submissions/:id/restore',
    authenticate,
    ownsProject,
    ownsForm,
    restoreSubmissionController)

module.exports = router
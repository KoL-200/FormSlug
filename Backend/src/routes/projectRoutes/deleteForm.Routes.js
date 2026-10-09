const express = require('express');
const router = express.Router();

const { deleteFormController } = require('../../controllers/projectControllers/form.Controllers');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');

/**
 * @swagger
 * /projects/{projectId}/forms/{formId}:
 *   delete:
 *     summary: Delete a form
 *     description: Soft-deletes the form. The returned record includes its current API key.
 *     tags: [Forms]
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
 *     responses:
 *       200:
 *         description: Form deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessForm'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.delete(
    '/projects/:projectId/forms/:formId',
    authenticate,
    ownsProject,
    ownsForm,
    deleteFormController,
);

module.exports = router;
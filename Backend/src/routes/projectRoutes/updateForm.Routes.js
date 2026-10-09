const express = require('express');
const router = express.Router();

const { updateFormController } = require('../../controllers/projectControllers/form.Controllers');
const { updateFormSchema } = require('../../validators/projectSchema/form.Validator');
const validate = require('../../middleware/validate.Middleware');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const ownsForm = require('../../middleware/ownsForm.Middleware');
const { rotateApiKeyController } = require('../../controllers/projectControllers/rotateApikey.Controller')

/**
 * @swagger
 * /projects/{projectId}/forms/{formId}/rotate-key:
 *   post:
 *     summary: Rotate a form API key
 *     description: The previous key stops working. Store the new key securely.
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
 *         description: API key rotated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RotatedApiKeyResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
    '/projects/:projectId/forms/:formId/rotate-key',
    authenticate,
    ownsProject,
    ownsForm,
    rotateApiKeyController
);

/**
 * @swagger
 * /projects/{projectId}/forms/{formId}:
 *   patch:
 *     summary: Update a form
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFormRequest'
 *     responses:
 *       200:
 *         description: Form updated with masked API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessForm'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch(
    '/projects/:projectId/forms/:formId',
    authenticate,
    ownsProject,
    ownsForm,
    validate(updateFormSchema),
    updateFormController,
);

module.exports = router;
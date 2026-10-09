const express = require('express');
const router = express.Router();

const { createFormController, getFormsController, getFormsByIdController } = require('../../controllers/projectControllers/form.Controllers');
const { createFormSchema } = require('../../validators/projectSchema/form.Validator');

const validate = require('../../middleware/validate.Middleware');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');

/**
 * @swagger
 * /projects/{projectId}/forms:
 *   post:
 *     summary: Create a form
 *     description: The full API key is returned once in this response. Store it securely; later form reads mask it.
 *     tags: [Forms]
 *     parameters:
 *       - name: projectId
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
 *             $ref: '#/components/schemas/FormRequest'
 *     responses:
 *       201:
 *         description: Form created
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
router.post('/projects/:projectId/forms', authenticate, ownsProject, validate(createFormSchema), createFormController);

/**
 * @swagger
 * /projects/{projectId}/forms/{formId}:
 *   get:
 *     summary: Get a form
 *     description: The API key is masked in this response.
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
 *         description: Form details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessForm'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/projects/:projectId/forms/:formId', authenticate, ownsProject, getFormsByIdController);

/**
 * @swagger
 * /projects/{projectId}/forms:
 *   get:
 *     summary: List project forms
 *     description: API keys are masked in this response.
 *     tags: [Forms]
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Forms ordered newest first
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessFormList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/projects/:projectId/forms', authenticate, ownsProject, getFormsController);

module.exports = router;
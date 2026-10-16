const express = require('express');
const router = express.Router();

const { createProjectSchema, updateProjectSchema } = require('../../validators/projectSchema/project.Validator')
const validate = require('../../middleware/validate.Middleware');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const { createProjectController, getProjectByIdController, updateProjectController } = require('../../controllers/projectControllers/project.Controllers');

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Get a project
 *     tags: [Projects]
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessProject'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/projects/:projectId', authenticate, ownsProject, getProjectByIdController)

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectRequest'
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessProject'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/projects', authenticate, validate(createProjectSchema), createProjectController)
router.patch('/projects/:projectId', authenticate, ownsProject, validate(updateProjectSchema), updateProjectController)

module.exports = router
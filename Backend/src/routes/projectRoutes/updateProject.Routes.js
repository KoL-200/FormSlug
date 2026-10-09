const express = require('express');
const router = express.Router();

const { updateProjectSchema } = require('../../validators/projectSchema/project.Validator')
const validate = require('../../middleware/validate.Middleware');
const authenticate = require('../../middleware/authenicate.Middleware');
const ownsProject = require('../../middleware/ownsProject.Middleware');
const { updateProjectController } = require('../../controllers/projectControllers/project.Controllers');

/**
 * @swagger
 * /projects/{projectId}:
 *   patch:
 *     summary: Update a project
 *     tags: [Projects]
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
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Project updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessProject'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch('/projects/:projectId', authenticate, ownsProject, validate(updateProjectSchema), updateProjectController)

module.exports = router
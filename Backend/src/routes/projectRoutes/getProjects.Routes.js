const express = require('express');
const authenticate = require('../../middleware/authenicate.Middleware');
const { getProjectsController } = require('../../controllers/projectControllers/project.Controllers');

const router = express.Router();

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: List the current user's projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Projects ordered newest first
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessProjectList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/projects', authenticate, getProjectsController);

module.exports = router;
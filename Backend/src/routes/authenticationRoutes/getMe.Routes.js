const express = require('express');
const router = express.Router();

const { getUser } = require('../../controllers/authenticationControllers/getMe.Controller')

const authenticate = require('../../middleware/authenicate.Middleware')

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessUser'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/users/me', authenticate, getUser)

module.exports = router
const express = require('express')
const router = express.Router()

const { logout } = require('../../controllers/authenticationControllers/logout.Controller')

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out
 *     description: Revokes the refresh token when one is present and returns success.
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
router.post('/logout', logout)

module.exports = router
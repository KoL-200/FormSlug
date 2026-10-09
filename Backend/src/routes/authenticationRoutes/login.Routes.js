const express = require('express');
const router = express.Router();

const validate = require('../../middleware/validate.Middleware');
const { loginSchema } = require('../../validators/authSchema/auth.Validator');
const { login } = require('../../controllers/authenticationControllers/login.Controller');
const { refreshAccessTokenController } = require('../../controllers/authenticationControllers/refreshToken.Controller');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in
 *     description: Returns an access token and sets an HttpOnly refresh-token cookie.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/login', validate(loginSchema), login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh the access token
 *     description: Rotates the refresh-token cookie and returns a new access token.
 *     tags: [Auth]
 *     security:
 *       - refreshTokenCookie: []
 *     responses:
 *       200:
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessTokenResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/refresh', refreshAccessTokenController);

module.exports = router;
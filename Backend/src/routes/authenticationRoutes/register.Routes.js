const express = require('express');
const router = express.Router();

const validate = require('../../middleware/validate.Middleware');
const { registerSchema } = require('../../validators/authSchema/auth.Validator');
const { registerUser } = require('../../controllers/authenticationControllers/register.Controller');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               name:
 *                 type: string
 *                 minLength: 1
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessUser'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/register', validate(registerSchema), registerUser);

module.exports = router;
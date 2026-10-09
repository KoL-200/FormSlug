const express = require('express');
const router = express.Router();

const { updateUser } = require('../../controllers/authenticationControllers/updateMe.Controller')
const { updateUserPassword } = require('../../controllers/authenticationControllers/updateUserPassword.Controller')
const authenticate = require('../../middleware/authenicate.Middleware')
const { updateSchema, updatePasswordSchema } = require('../../validators/authSchema/auth.Validator')
const validate = require('../../middleware/validate.Middleware')

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update the current user's profile
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessUser'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/users/me', authenticate, validate(updateSchema), updateUser)

/**
 * @swagger
 * /users/me/password:
 *   patch:
 *     summary: Change the current user's password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/users/me/password', authenticate, validate(updatePasswordSchema), updateUserPassword)

module.exports = router
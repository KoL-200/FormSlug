const express = require('express');
const router = express.Router();

const { deleteAccountController } = require('../../controllers/authenticationControllers/softDeleteUserAccount.Controller.js');
const authenticate = require('../../middleware/authenicate.Middleware')

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Schedule account deletion
 *     description: Soft-deletes the account and its projects/forms with a 30-day recovery period.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Account deletion scheduled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/users/me', authenticate, deleteAccountController)

module.exports = router
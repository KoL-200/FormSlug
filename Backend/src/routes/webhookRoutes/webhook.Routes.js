const express = require('express');
const router = express.Router();

const validate = require('../../middleware/validate.Middleware');
const authenticate = require('../../middleware/authenicate.Middleware')
const ownsProject = require('../../middleware/ownsProject.Middleware')
const { createWebhookSchema, updateWebhookSchema } = require('../../validators/WebhookSchema/webhookSchema.Validator');

const { createWebhookController, updateWebhookController, deleteWebhookController, testWebhookController } = require('../../controllers/webhookControllers/webhook.Controllers')


router.post('/projects/:projectId/webhooks', authenticate, ownsProject, validate(createWebhookSchema), createWebhookController);
router.patch('/projects/:projectId/webhooks/:id', authenticate, ownsProject, validate(updateWebhookSchema), updateWebhookController);
router.delete('/projects/:projectId/webhooks/:id', authenticate, ownsProject, deleteWebhookController);
router.post('/projects/:projectId/webhooks/:id/test', authenticate, ownsProject, testWebhookController);

module.exports = router;
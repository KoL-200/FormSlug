const express = require('express');
const router = express.Router();

const validate = require('../../middleware/validate.Middleware');
const authenticate = require('../../middleware/authenicate.Middleware')
const ownsProject = require('../../middleware/ownsProject.Middleware')
const { createWebhookSchema, updateWebhookSchema } = require('../../validators/WebhookSchema/webhookSchema.Validator');

const { listWebhooksController, createWebhookController, updateWebhookController, deleteWebhookController, testWebhookController } = require('../../controllers/webhookControllers/webhook.Controllers')

/**
 * @swagger
 * /projects/{projectId}/webhooks:
 *   get:
 *     summary: List a project's webhook endpoints
 *     description: Signing secrets are never included in this response.
 *     tags: [Webhooks]
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *          description: Webhook endpoints ordered newest first
 content:
   application/json:
     schema:
       type: object
       properties:
         success:
           type: boolean
         data:
           type: array
           items:
             type: object
             properties:
               id:
                 type: string
                 format: uuid
               project_id:
                 type: string
                 format: uuid
               url:
                 type: string
                 format: uri
               events:
                 type: array
                 items:
                   type: string
               is_active:
                 type: boolean
               created_at:
                 type: string
                 format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/projects/:projectId/webhooks', authenticate, ownsProject, listWebhooksController);

/**
 * @swagger
 * /projects/{projectId}/webhooks:
 *   post:
 *     summary: Create a webhook endpoint
 *     description: Webhook URLs must use HTTPS. The generated signing secret is returned in the response.
 *     tags: [Webhooks]
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
 *             $ref: '#/components/schemas/WebhookRequest'
 *     responses:
 *       201:
 *         description: Webhook created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessWebhook'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/projects/:projectId/webhooks', authenticate, ownsProject, validate(createWebhookSchema), createWebhookController);

/**
 * @swagger
 * /projects/{projectId}/webhooks/{id}:
 *   patch:
 *     summary: Update a webhook endpoint
 *     description: Provide at least one of url or is_active. Any URL must use HTTPS.
 *     tags: [Webhooks]
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
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
 *             $ref: '#/components/schemas/UpdateWebhookRequest'
 *     responses:
 *       200:
 *         description: Webhook updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessWebhook'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/projects/:projectId/webhooks/:id', authenticate, ownsProject, validate(updateWebhookSchema), updateWebhookController);

/**
 * @swagger
 * /projects/{projectId}/webhooks/{id}:
 *   delete:
 *     summary: Delete a webhook endpoint
 *     tags: [Webhooks]
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Webhook deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/projects/:projectId/webhooks/:id', authenticate, ownsProject, deleteWebhookController);

/**
 * @swagger
 * /projects/{projectId}/webhooks/{id}/test:
 *   post:
 *     summary: Send a test webhook delivery
 *     tags: [Webhooks]
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Test delivery result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessWebhookTest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/projects/:projectId/webhooks/:id/test', authenticate, ownsProject, testWebhookController);

module.exports = router;
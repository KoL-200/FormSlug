const express = require('express');
const router = express.Router();

const { activeFormBySlugController } = require('../../controllers/projectControllers/activeFormBySlug.Controller.js');
const submissionRateLimit = require('../../middleware/submissionRateLimit.Middleware.js');

/**
 * @swagger
 * /f/{slug}:
 *   post:
 *     summary: Submit data to a public form
 *     description: >
 *       Send submitted fields as a top-level JSON object. A form API key is
 *       optional; when supplied use `Authorization: Bearer <form_api_key>`. A
 *       truthy `_gotcha` honeypot value returns success without storing a
 *       submission. Webhook deliveries are asynchronous.
 *     tags: [Public submissions]
 *     security:
 *       - formApiKey: []
 *       - {}
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         description: Public form slug returned when the form is created
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: Each object may contain up to 50 fields, string values may be up to 10,000 characters, and nested values are limited to four levels.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *           example:
 *             name: Ada Lovelace
 *             email: ada@example.com
 *             message: Please send me more information.
 *             preferences:
 *               contactBy: email
 *     responses:
 *       200:
 *         description: Submission accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmissionAccepted'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 */
router.post('/f/:slug', submissionRateLimit, activeFormBySlugController);

module.exports = router;
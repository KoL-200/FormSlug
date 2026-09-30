const express = require('express');
const router = express.Router();

const { activeFormBySlugController } = require('../../controllers/projectControllers/activeFormBySlug.Controller.js');
const submissionRateLimit = require('../../middleware/submissionRateLimit.Middleware.js');

router.post('/f/:slug', submissionRateLimit, activeFormBySlugController);

module.exports = router;
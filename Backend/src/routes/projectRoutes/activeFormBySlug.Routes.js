const express = require('express');
const router = express.Router();

const { activeFormBySlugController } = require('../../controllers/projectControllers/activeFromBySlug.Controllers');

router.post('/f/:slug', activeFormBySlugController);

module.exports = router;
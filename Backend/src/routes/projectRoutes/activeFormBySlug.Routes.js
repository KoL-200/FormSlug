const express = require('express');
const router = express.Router();

const { activeFormBySlugController } = require('../../controllers/projectControllers/activeFormBySlug.Controller.js');

router.post('/f/:slug', activeFormBySlugController);

module.exports = router;
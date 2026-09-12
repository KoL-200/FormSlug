const { listSubmissions } = require('../../services/projectServices/listSubmision.Services');

const listSubmissionsController = async (req, res) => {
    const formId = req.form.id;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const includeDeleted = req.query.includeDeleted === 'true';
    const { from, to } = req.query;
    const { submissions, meta } = await listSubmissions({ formId, page, limit, includeDeleted, from, to });

    res.status(200).json({ success: true, data: submissions, meta });
};

module.exports = {
    listSubmissionsController,
};
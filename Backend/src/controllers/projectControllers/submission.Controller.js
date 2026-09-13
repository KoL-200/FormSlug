const { listSubmissions, getSubmissionById } = require('../../services/projectServices/listSubmision.Services');
const { submissionDelete, submissionRestore } = require('../../services/projectServices/submissionDeleteAndRestore.Services');

const listSubmissionsController = async (req, res) => {
    const formId = req.form.id;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const includeDeleted = req.query.includeDeleted === 'true';
    const { from, to } = req.query;
    const { submissions, meta } = await listSubmissions({ formId, page, limit, includeDeleted, from, to });

    res.status(200).json({ success: true, data: submissions, meta });
};

const getSubmissionByIdController = async (req, res) => {
    const formId = req.form.id;
    const submissionId = req.params.id;

    const result = await getSubmissionById({ formId, submissionId })

    res.status(200).json({ success: true, data: result })
}

const deleteSubmissionController = async (req, res) => {
    const formId = req.form.id;
    const submissionId = req.params.id;

    await submissionDelete({ formId, submissionId })

    res.status(200).json({ success: true, message: 'Submission deleted sucessfully' })
}

const restoreSubmissionController = async (req, res) => {
    const formId = req.form.id;
    const submissionId = req.params.id;

    await submissionRestore({ formId, submissionId })

    res.status(200).json({ success: true, message: 'Submission restored sucessfully' })
}

module.exports = {
    listSubmissionsController,
    getSubmissionByIdController,
    deleteSubmissionController,
    restoreSubmissionController
};
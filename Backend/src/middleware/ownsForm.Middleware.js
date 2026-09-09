const { prisma } = require('../config/database.Config');
const { NotFoundError } = require('../utils/AppError');

const ownsForm = async (req, res, next) => {
    const formId = req.params?.formId
    const projectId = req.project?.id;

    if (!formId || !projectId) {
        return next(new NotFoundError('Form not found'));
    }

    const form = await prisma.form.findUnique({
        where: { id: formId },
    });

    if (!form || form.project_id !== projectId || form.deleted_at !== null) {
        return next(new NotFoundError('Form not found'));
    }

    req.form = form;
    return next();
};

module.exports = ownsForm;
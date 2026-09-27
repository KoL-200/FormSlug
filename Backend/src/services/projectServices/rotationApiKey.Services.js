const { prisma } = require('../../config/database.Config');
const { nanoid } = require('nanoid');
const { NotFoundError } = require('../../utils/AppError');

const rotateFormApiKey = async ({ formId, projectId }) => {
    const result = await prisma.form.updateMany({
        where: {
            id: formId,
            project_id: projectId,
            deleted_at: null,
        },
        data: { api_key: nanoid(32) },
    });

    if (result.count === 0) {
        throw new NotFoundError('Form not found');
    }

    return prisma.form.findUnique({
        where: { id: formId },
        select: { id: true, api_key: true, updated_at: true },
    });
};

module.exports = { rotateFormApiKey };
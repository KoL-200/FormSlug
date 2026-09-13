const { prisma } = require('../../config/database.Config');

async function submission({ submissionId, formId }) {
    return prisma.submission.findFirst({
        where: {
            id: submissionId,
            form_id: formId
        }
    });
}

const listSubmissions = async ({ formId, page, limit, includeDeleted, from, to }) => {
    const where = {
        form_id: formId,
        ...(includeDeleted ? {} : { deleted_at: null }),
    }

    if (from || to) {
        where.created_at = {}
        if (from) {
            where.created_at.gte = new Date(from)
        }
        if (to) {
            where.created_at.lte = new Date(to)
        }
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [submissions, total] = await Promise.all(
        [
            prisma.submission.findMany(
                {
                    where,
                    skip,
                    take,
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            ),

            prisma.submission.count({ where })
        ]
    )

    const totalPages = Math.ceil(total / limit);

    return {
        submissions,
        meta:
        {
            total,
            totalPages,
            page
        }
    }
}

const getSubmissionById = async ({ submissionId, formId }) => {
    const submisionData = await submission({ submissionId, formId });

    if (!submisionData) {
        throw new NotFoundError('Submission not found');
    }

    return submisionData;
}

module.exports = { listSubmissions, getSubmissionById }
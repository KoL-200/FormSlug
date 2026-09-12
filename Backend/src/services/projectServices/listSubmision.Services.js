const { prisma } = require('../../config/database.Config');

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

module.exports = { listSubmissions }
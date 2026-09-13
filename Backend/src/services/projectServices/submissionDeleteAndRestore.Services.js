const { prisma } = require('../../config/database.Config')
const { NotFoundError } = require('../../utils/AppError')

async function deleteSubmission({ formId, submissionId }) {
    return prisma.submission.updateMany(
        {
            where: {
                id: submissionId,
                form_id: formId,
                deleted_at: null
            },
            data: {
                deleted_at: new Date()
            }
        }
    )
}

async function restoreSubmission({ formId, submissionId }) {
    return prisma.submission.updateMany(
        {
            where: {
                id: submissionId,
                form_id: formId,
                deleted_at: { not: null }
            },
            data: {
                deleted_at: null
            }
        }
    )
}

const submissionDelete = async ({ formId, submissionId }) => {
    const result = await deleteSubmission({ formId, submissionId })

    if (result.count === 0) {
        throw new NotFoundError('Submission not found')
    }

    return result
}

const submissionRestore = async ({ formId, submissionId }) => {
    const restore = await restoreSubmission({ formId, submissionId })

    if (restore.count === 0) {
        throw new NotFoundError('Not found')
    }

    return restore
}

module.exports = {
    submissionDelete,
    submissionRestore
}
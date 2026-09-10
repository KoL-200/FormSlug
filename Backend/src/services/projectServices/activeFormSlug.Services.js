const { prisma } = require('../../config/database.Config');
const { NotFoundError, ForbiddenError } = require('../../utils/AppError');

async function findActiveFormBySlug(slug) {
    return prisma.form.findUnique(
        {
            where: {
                slug
            }
        }
    )
}

const activeFormBySlug = async (slug) => {
    const form = await findActiveFormBySlug(slug);

    if (!form || form.deleted_at) {
        throw new NotFoundError('Form currently not available');
    }

    if (!form.is_active) {
        throw new ForbiddenError('This form is currently not accepting submissions');
    }

    return form;
}

module.exports = {
    activeFormBySlug
}
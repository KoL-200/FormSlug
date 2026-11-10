const { prisma } = require('../../config/database.Config');
const { getCachedForm, setCachedForm } = require('../../utils/FormCache');

async function activeFormBySlug(slug) {
    if (process.env.NODE_ENV === 'test') {
        const form = await prisma.form.findUnique({ where: { slug } });
        return form && !form.deleted_at ? form : null;
    }

    const cached = await getCachedForm(slug);
    if (cached) {
        return cached;
    }

    const form = await prisma.form.findUnique({ where: { slug } });

    if (form && !form.deleted_at && form.is_active) {
        await setCachedForm(slug, form);
    }

    return form && !form.deleted_at ? form : null;
}

module.exports = {
    activeFormBySlug
}
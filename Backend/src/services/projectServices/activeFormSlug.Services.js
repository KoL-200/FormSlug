const { prisma } = require('../../config/database.Config');
const { getCachedForm, setCachedForm } = require('../../utils/FormCache');

async function activeFormBySlug(slug) {
    const cached = await getCachedForm(slug);
    if (cached) {
        // console.log('cache hit')
        return cached
    };

    // console.log('db hit')
    const form = await prisma.form.findUnique({ where: { slug } });

    if (form && !form.deleted_at && form.is_active) {
        await setCachedForm(slug, form);
    }

    return form;
}

module.exports = {
    activeFormBySlug
}
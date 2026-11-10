const { prisma } = require('../../config/database.Config');
const { invalidateFormCache } = require('../../utils/FormCache');

const deleteProject = async (projectId) => {
    const deletedAt = new Date();
    const forms = await prisma.form.findMany({
        where: { project_id: projectId },
        select: { slug: true },
    });

    const deletedProject = await prisma.$transaction(async (transaction) => {
        await transaction.form.updateMany({
            where: {
                project_id: projectId,
            },
            data: {
                deleted_at: deletedAt,
            },
        });

        return transaction.project.update({
            where: {
                id: projectId,
            },
            data: {
                deleted_at: deletedAt,
            },
        });
    });

    await Promise.all(forms.map(({ slug }) => invalidateFormCache(slug)));
    return deletedProject;
};

module.exports = {
    deleteProject,
};
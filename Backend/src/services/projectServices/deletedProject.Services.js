const { prisma } = require('../../config/database.Config');

const deleteProject = async (projectId) => {
    const deletedAt = new Date();

    return prisma.$transaction(async (transaction) => {
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
};

module.exports = {
    deleteProject,
};
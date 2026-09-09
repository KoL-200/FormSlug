const { prisma } = require('../../config/database.Config');

const projectUpdate = async ({ projectId, name }) => {
    return prisma.project.update({
        where: {
            id: projectId,
        },
        data: {
            name,
        },
    });
};

module.exports = {
    projectUpdate
}
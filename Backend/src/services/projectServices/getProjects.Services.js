const { prisma } = require('../../config/database.Config');

const getProjects = async ({ userId }) => {
    return prisma.project.findMany({
        where: {
            user_id: userId,
            deleted_at: null,
        },
        orderBy: {
            created_at: 'desc',
        },
    });
};

module.exports = {
    getProjects,
};
const { prisma } = require('../../config/database.Config');

const createProject = async ({ userId, name }) => {
    return prisma.project.create({
        data: {
            user_id: userId,
            name,
        },
    });
};

module.exports = {
    createProject,
};
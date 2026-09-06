const { prisma } = require('../config/database.Config');
const { NotFoundError } = require('../utils/AppError');

const ownsProject = async (req, res, next) => {
    const projectId = req.params?.projectId
    const userId = req.user?.id;

    if (!projectId || !userId) {
        return next(new NotFoundError('Project not found'));
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project || project.user_id !== userId) {
        return next(new NotFoundError('Project not found'));
    }

    req.project = project;
    return next();
};

module.exports = ownsProject;
const { createProject } = require('../../services/projectServices/createProject.Services');
const { getProjects } = require('../../services/projectServices/getProjects.Services');

const createProjectController = async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;
    const createdProject = await createProject({ userId, name });

    res.status(201).json({ success: true, data: createdProject });
};

const getProjectsController = async (req, res) => {
    const projects = await getProjects({ userId: req.user.id });

    res.status(200).json({ success: true, data: projects });
};

module.exports = { createProjectController, getProjectsController };
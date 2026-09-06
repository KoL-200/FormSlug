const { createProject } = require('../../services/projectServices/createProject.Services');

const createProjectController = async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;
    const createdProject = await createProject({ userId, name });

    res.status(201).json({ success: true, data: createdProject });
};

module.exports = { createProjectController };
const { createProject } = require('../../services/projectServices/createProject.Services');
const { getProjects } = require('../../services/projectServices/getProjects.Services');
const { projectUpdate } = require('../../services/projectServices/updateProject.Services');
const { deleteProject } = require('../../services/projectServices/deletedProject.Services');

const { writeAuditLog } = require('../../utils/auditLog');

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

const updateProjectController = async (req, res) => {
    const { projectId } = req.params;
    const { name } = req.body;

    const updatedProject = await projectUpdate({ projectId, name });
    res.status(200).json({ success: true, data: updatedProject });
}

const deleteProjectController = async (req, res) => {
    const deletedProject = await deleteProject(req.params.projectId);

    await writeAuditLog({
        userId: req.user.id,
        action: 'project.deleted',
        metadata: { projectId: req.params.projectId },
        ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: deletedProject });
};

module.exports = {
    createProjectController,
    getProjectsController,
    updateProjectController,
    deleteProjectController,
};
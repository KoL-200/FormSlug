const { createForm, getForms, updateForm, deleteForm } = require('../../services/projectServices/form.Services');
const { writeAuditLog } = require('../../utils/auditLog');

const createFormController = async (req, res) => {
    const projectId = req.params.projectId;
    const userId = req.user.id;
    const { name, notification_email } = req.body;

    const createdForm = await createForm({ projectId, userId, name, notificationEmail: notification_email });
    res.status(201).json({ success: true, data: createdForm });
}

const getFormsController = async (req, res) => {
    const forms = await getForms({ projectId: req.params.projectId });

    res.status(200).json({ success: true, data: forms });
}

const updateFormController = async (req, res) => {
    const updatedForm = await updateForm({
        formId: req.params.formId,
        ...req.body,
    });

    res.status(200).json({ success: true, data: updatedForm });
};

const deleteFormController = async (req, res) => {
    const deletedForm = await deleteForm(req.params.formId);

    await writeAuditLog({
        userId: req.user.id,
        action: 'form.deleted',
        metadata: {
            formId: req.params.formId,
            projectId: req.params.projectId,
        },
        ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: deletedForm });
};

module.exports = {
    createFormController,
    getFormsController,
    updateFormController,
    deleteFormController,
}
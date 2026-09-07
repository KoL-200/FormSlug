const { createForm, getForms } = require('../../services/projectServices/Form.Services');

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

module.exports = {
    createFormController,
    getFormsController,
}
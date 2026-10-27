const { listWebhooks, createWebhook, updateWebhook, deleteWebhook } = require("../../services/webhookServices/webhook.Services");
const { testWebhook } = require('../../services/webhookServices/testWebhook.Services');
const { writeAuditLog } = require('../../utils/auditLog');

const listWebhooksController = async (req, res) => {
    const { projectId } = req.params;
    const webhooks = await listWebhooks({ projectId });
    res.status(200).json({ success: true, data: webhooks });
};

const createWebhookController = async (req, res) => {
    const { projectId } = req.params;
    const { url } = req.body;

    const webhookResult = await createWebhook({ projectId, url });
    res.status(201).json({ success: true, data: webhookResult });
};

const updateWebhookController = async (req, res) => {
    const { projectId, id: webhookId } = req.params;
    const { url, is_active } = req.body;

    const webhookResult = await updateWebhook({ projectId, webhookId, url, is_active });
    res.status(200).json({ success: true, data: webhookResult });
};

const deleteWebhookController = async (req, res) => {
    const { projectId, id: webhookId } = req.params;

    await deleteWebhook({ projectId, webhookId });

    await writeAuditLog({
        userId: req.user.id,
        action: 'webhook.deleted',
        metadata: {
            webhookId: req.params.id,
            projectId: req.params.projectId,
        },
        ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Webhook deleted successfully' });
};

const testWebhookController = async (req, res) => {
    const { projectId, id: webhookId } = req.params;

    const result = await testWebhook({ projectId, webhookId });
    res.status(200).json({ success: true, data: result });
};

module.exports = {
    listWebhooksController,
    createWebhookController,
    updateWebhookController,
    deleteWebhookController,
    testWebhookController,
};
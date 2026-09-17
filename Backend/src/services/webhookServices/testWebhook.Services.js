const { prisma } = require('../../config/database.Config');
const { NotFoundError } = require('../../utils/AppError');
const signPayload = require('../../utils/SignPayload');

const getWebhookById = async ({ projectId, webhookId }) => {
    const webhook = await prisma.webhookEndpoint.findFirst({
        where: { id: webhookId, project_id: projectId },
    });

    if (!webhook) {
        throw new NotFoundError('Webhook not found');
    }

    return webhook;
};

const buildTestPayload = () => ({
    event: 'submission.created',
    test: true,
    data: {
        name: 'Test Submitter',
        email: 'test@example.com',
        message: 'This is a test webhook delivery.',
    },
    submitted_at: new Date().toISOString(),
});

const testWebhook = async ({ projectId, webhookId }) => {
    const webhook = await getWebhookById({ projectId, webhookId });

    const payloadString = JSON.stringify(buildTestPayload());
    const signature = signPayload(payloadString, webhook.secret);

    try {
        const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
            },
            body: payloadString,
        });

        return {
            delivered: true,
            statusCode: response.status,
            error: null,
        };
    } catch (err) {
        return {
            delivered: false,
            statusCode: null,
            error: err.message,
        };
    }
};

module.exports = { getWebhookById, testWebhook };
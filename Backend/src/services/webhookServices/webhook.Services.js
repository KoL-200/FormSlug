const { prisma } = require('../../config/database.Config')

const { nanoid } = require('nanoid')
const { NotFoundError } = require('../../utils/AppError')

const signPayload = require('../../utils/SignPayload')

const createWebhook = async ({ projectId, url }) => {
    const secret = nanoid(32)

    return prisma.webhookEndpoint.create(
        {
            data: {
                project_id: projectId,
                url,
                secret
            }
        }
    )
}

const updateWebhook = async ({ projectId, webhookId, url, is_active }) => {
    const data = {};

    if (url !== undefined) data.url = url;
    if (is_active !== undefined) data.is_active = is_active;

    const result = await prisma.webhookEndpoint.updateMany({
        where: {
            id: webhookId,
            project_id: projectId,
        },
        data,
    });

    if (result.count === 0) {
        throw new NotFoundError('Webhook not found');
    }

    return prisma.webhookEndpoint.findUnique({
        where: { id: webhookId },
    });
}

const deleteWebhook = async ({ projectId, webhookId }) => {
    const result = await prisma.webhookEndpoint.deleteMany({
        where: { id: webhookId, project_id: projectId },
    });

    if (result.count === 0) {
        throw new NotFoundError('Webhook not found');
    }

    return result;
};

module.exports = {
    createWebhook,
    updateWebhook,
    deleteWebhook
}
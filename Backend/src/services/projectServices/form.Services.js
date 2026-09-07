const { prisma } = require('../../config/database.Config');
const { nanoid } = require('nanoid');

async function getUserEmail(userId) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
    });
}

const createForm = async ({ projectId, userId, name, notificationEmail }) => {
    let resolvedNotificationEmail = notificationEmail;

    if (!resolvedNotificationEmail) {
        const user = await getUserEmail(userId);
        resolvedNotificationEmail = user?.email;
    }

    const slug = nanoid(10);
    const apiKey = nanoid(32);

    return prisma.form.create({
        data: {
            project_id: projectId,
            name,
            slug,
            api_key: apiKey,
            config: {},
            notification_email: resolvedNotificationEmail,
        },
    });
}

const getForms = async ({ projectId }) => {
    return prisma.form.findMany({
        where: {
            project_id: projectId,
            deleted_at: null,
        },
        orderBy: {
            created_at: 'desc',
        },
    });
};

module.exports = {
    createForm,
    getForms,
};
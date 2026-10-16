const { prisma } = require('../src/config/database.Config');
const { hashPassword } = require('../src/utils/hashing');
const { nanoid } = require('nanoid');

async function createTestUser(overrides = {}) {
    return prisma.user.create({
        data: {
            email: (overrides.email || `test-${nanoid(6)}@example.com`).toLowerCase(),
            password_hash: await hashPassword(overrides.password || 'TestPassword123'),
            name: overrides.name || 'Test User',
        },
    });
}

async function createTestProject(userId, overrides = {}) {
    return prisma.project.create({
        data: {
            user_id: userId,
            name: overrides.name || 'Test Project',
        },
    });
}

async function createTestForm(projectId, overrides = {}) {
    return prisma.form.create({
        data: {
            project_id: projectId,
            name: overrides.name || 'Test Form',
            slug: nanoid(10),
            api_key: nanoid(32),
            config: {},
            notification_email: overrides.notification_email || 'test@example.com',
            is_active: overrides.is_active !== undefined ? overrides.is_active : true,
        },
    });
}

async function loginTestUser(app, email, password = 'TestPassword123') {
    const request = require('supertest');
    const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });
    return res.body.data.accessToken;
}

async function cleanDatabase() {
    await prisma.$transaction([
        prisma.auditLog.deleteMany(),
        prisma.notificationLog.deleteMany(),
        prisma.webhookDelivery.deleteMany(),
        prisma.webhookEndpoint.deleteMany(),
        prisma.submission.deleteMany(),
        prisma.refreshToken.deleteMany(),
        prisma.form.deleteMany(),
        prisma.project.deleteMany(),
        prisma.user.deleteMany(),
    ]);
}

module.exports = {
    createTestUser,
    createTestProject,
    createTestForm,
    loginTestUser,
    cleanDatabase,
};
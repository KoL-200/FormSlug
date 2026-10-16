const request = require('supertest');
const app = require('../src/app');
const { nanoid } = require('nanoid');
const { prisma } = require('../src/config/database.Config');
const {
    createTestUser,
    createTestProject,
    createTestForm,
    loginTestUser,
    cleanDatabase,
} = require('./helpers');

beforeAll(async () => {
    await cleanDatabase();
});

afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
});

describe('Tenant isolation', () => {
    let userA, userB, projectA, formA, tokenB;

    beforeEach(async () => {
        const emailA = `usera-${nanoid(6)}@example.com`;
        const emailB = `userb-${nanoid(6)}@example.com`;

        userA = await createTestUser({ email: emailA });
        userB = await createTestUser({ email: emailB });
        projectA = await createTestProject(userA.id);
        formA = await createTestForm(projectA.id);
        tokenB = await loginTestUser(app, emailB);
    });

    afterEach(async () => {
        await cleanDatabase();
    });

    it('returns 404 when user B tries to access user A project', async () => {
        const res = await request(app)
            .get(`/api/v1/projects/${projectA.id}`)
            .set('Authorization', `Bearer ${tokenB}`);

        expect(res.status).toBe(404);
    });

    it('returns 404 when user B tries to access user A form', async () => {
        const res = await request(app)
            .get(`/api/v1/projects/${projectA.id}/forms/${formA.id}`)
            .set('Authorization', `Bearer ${tokenB}`);

        expect(res.status).toBe(404);
    });

    it('returns 404 when user B tries to list submissions on user A form', async () => {
        const res = await request(app)
            .get(`/api/v1/projects/${projectA.id}/forms/${formA.id}/submissions`)
            .set('Authorization', `Bearer ${tokenB}`);

        expect(res.status).toBe(404);
    });

    it('returns 404 when user B tries to delete user A project', async () => {
        const res = await request(app)
            .delete(`/api/v1/projects/${projectA.id}`)
            .set('Authorization', `Bearer ${tokenB}`);

        expect(res.status).toBe(404);

        // confirm the project still exists — wasn't deleted
        const project = await prisma.project.findUnique({
            where: { id: projectA.id },
        });
        expect(project).not.toBeNull();
        expect(project.deleted_at).toBeNull();
    });

    it('returns 401 when no auth token is provided', async () => {
        const res = await request(app)
            .get(`/api/v1/projects/${projectA.id}`);

        expect(res.status).toBe(401);
    });
});
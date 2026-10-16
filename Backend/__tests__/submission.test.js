const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/config/database.Config');
const {
    createTestUser,
    createTestProject,
    createTestForm,
    cleanDatabase,
} = require('./helpers');

beforeAll(async () => {
    await cleanDatabase();
});

afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
});

describe('Public submission endpoint POST /f/:slug', () => {
    let form;

    beforeEach(async () => {
        const user = await createTestUser();
        const project = await createTestProject(user.id);
        form = await createTestForm(project.id);
    });

    afterEach(async () => {
        await cleanDatabase();
    });

    it('persists a submission and returns 200 for valid data', async () => {
        const res = await request(app)
            .post(`/f/${form.slug}`)
            .send({ name: 'Test User', email: 'user@example.com', message: 'Hello' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const submission = await prisma.submission.findFirst({
            where: { form_id: form.id },
        });

        expect(submission).not.toBeNull();
        expect(submission.data).toMatchObject({
            name: 'Test User',
            email: 'user@example.com',
        });
    });

    it('returns 200 but does NOT persist when honeypot field is filled', async () => {
        const before = await prisma.submission.count({ where: { form_id: form.id } });

        const res = await request(app)
            .post(`/f/${form.slug}`)
            .send({ name: 'Bot', email: 'bot@spam.com', _gotcha: 'i am a bot' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const after = await prisma.submission.count({ where: { form_id: form.id } });
        expect(after).toBe(before); // no new row
    });

    it('returns 422 when body is an array instead of an object', async () => {
        const res = await request(app)
            .post(`/f/${form.slug}`)
            .send([1, 2, 3]);

        expect(res.status).toBe(422);
    });

    it('returns 404 for a nonexistent slug', async () => {
        const res = await request(app)
            .post('/f/nonexistent-slug-xyz')
            .send({ name: 'Test' });

        expect(res.status).toBe(404);
    });

    it('returns 403 for an inactive form', async () => {
        const user = await createTestUser();
        const project = await createTestProject(user.id);
        const inactiveForm = await createTestForm(project.id, { is_active: false });

        const res = await request(app)
            .post(`/f/${inactiveForm.slug}`)
            .send({ name: 'Test' });

        expect(res.status).toBe(403);
    });

    it('strips __proto__ from nested payload without rejecting the submission', async () => {
        const res = await request(app)
            .post(`/f/${form.slug}`)
            .send({
                name: 'Test',
                nested: JSON.parse('{"__proto__":{"isAdmin":true}}'),
            });

        expect(res.status).toBe(200);

        const submission = await prisma.submission.findFirst({
            where: { form_id: form.id },
        });

        expect(Object.hasOwn(submission.data.nested, '__proto__')).toBe(false);
        expect(submission.data.nested).not.toHaveProperty('isAdmin');
    });
});
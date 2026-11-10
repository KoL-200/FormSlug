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
        expect(submission.data).toEqual({
            name: 'Test User',
            email: 'user@example.com',
            message: 'Hello',
        });
    });

    it('validates active fields and stores only matching field values', async () => {
        await prisma.formField.createMany({
            data: [
                { form_id: form.id, key: 'name', label: 'Name', type: 'TEXT', required: true },
                { form_id: form.id, key: 'email', label: 'Email', type: 'EMAIL', required: true },
                { form_id: form.id, key: 'color', label: 'Color', type: 'SELECT', required: true, options: ['Red', 'Blue'] },
                { form_id: form.id, key: 'updates', label: 'Updates', type: 'CHECKBOX', required: false },
                { form_id: form.id, key: 'old_note', label: 'Old note', type: 'TEXT', deleted_at: new Date() },
            ],
        });

        const res = await request(app)
            .post(`/f/${form.slug}`)
            .send({
                name: 'Ada',
                email: 'ada@example.com',
                color: 'Blue',
                updates: false,
                old_note: 'stale page value',
                not_a_field: 'drop this',
            });

        expect(res.status).toBe(200);

        const submission = await prisma.submission.findFirst({
            where: { form_id: form.id },
        });
        expect(submission.data).toEqual({
            name: 'Ada',
            email: 'ada@example.com',
            color: 'Blue',
            updates: false,
        });
    });

    it('serves and validates builder fields stored in form config', async () => {
        await prisma.form.update({
            where: { id: form.id },
            data: {
                config: {
                    description: 'A form from the dashboard builder',
                    fields: [
                        { id: 45, label: 'Your name', type: 'text', placeholder: 'Type your name', required: true },
                    ],
                },
            },
        });

        const publicRes = await request(app)
            .get(`/f/${form.slug}`);

        expect(publicRes.status).toBe(200);
        expect(publicRes.body.data.fields).toEqual([
            {
                key: 'legacy_45',
                label: 'Your name',
                type: 'TEXT',
                required: true,
                options: null,
                placeholder: 'Type your name',
            },
        ]);

        const submitRes = await request(app)
            .post(`/f/${form.slug}`)
            .send({ legacy_45: 'Ada' });

        expect(submitRes.status).toBe(200);
        const submission = await prisma.submission.findFirst({ where: { form_id: form.id } });
        expect(submission.data).toEqual({ legacy_45: 'Ada' });
    });

    it('returns field-keyed 422 details for invalid field values', async () => {
        await prisma.formField.createMany({
            data: [
                { form_id: form.id, key: 'name', label: 'Name', type: 'TEXT', required: true },
                { form_id: form.id, key: 'email', label: 'Email', type: 'EMAIL' },
                { form_id: form.id, key: 'color', label: 'Color', type: 'SELECT', options: ['Red', 'Blue'] },
                { form_id: form.id, key: 'updates', label: 'Updates', type: 'CHECKBOX' },
                { form_id: form.id, key: 'message', label: 'Message', type: 'TEXT' },
            ],
        });

        const res = await request(app)
            .post(`/f/${form.slug}`)
            .send({
                email: 'not-an-email',
                color: 'Green',
                updates: 'yes',
                message: 'x'.repeat(1001),
            });

        expect(res.status).toBe(422);
        expect(res.body.details).toEqual([
            { field: 'name', message: 'This field is required.' },
            { field: 'email', message: 'Enter a valid email address.' },
            { field: 'color', message: 'Select a valid option.' },
            { field: 'updates', message: 'Must be a boolean.' },
            { field: 'message', message: 'Must be at most 1000 characters.' },
        ]);
        await expect(prisma.submission.count({ where: { form_id: form.id } })).resolves.toBe(0);
    });

    it('returns 200 but does NOT persist when honeypot field is filled', async () => {
        await prisma.formField.create({
            data: {
                form_id: form.id,
                key: 'name',
                label: 'Name',
                type: 'TEXT',
                required: true,
            },
        });
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

    it('GET /f/:slug returns the public form payload without leaking internal fields', async () => {
        const fieldA = await prisma.formField.create({
            data: {
                form_id: form.id,
                key: 'first_name',
                label: 'First name',
                type: 'TEXT',
                required: true,
                placeholder: 'Jane',
                position: 2,
            },
        });

        const fieldB = await prisma.formField.create({
            data: {
                form_id: form.id,
                key: 'favorite_color',
                label: 'Favorite color',
                type: 'SELECT',
                required: false,
                options: ['Red', 'Blue'],
                placeholder: 'Choose one',
                position: 1,
            },
        });

        const res = await request(app)
            .get(`/f/${form.slug}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            data: {
                name: form.name,
                fields: [
                    {
                        key: fieldB.key,
                        label: fieldB.label,
                        type: 'SELECT',
                        required: false,
                        options: ['Red', 'Blue'],
                        placeholder: 'Choose one',
                    },
                    {
                        key: fieldA.key,
                        label: fieldA.label,
                        type: 'TEXT',
                        required: true,
                        options: null,
                        placeholder: 'Jane',
                    },
                ],
            },
        });

        expect(Object.keys(res.body)).toEqual(['success', 'data']);
        expect(Object.keys(res.body.data)).toEqual(['name', 'fields']);
        expect(Object.keys(res.body.data.fields[0])).toEqual([
            'key',
            'label',
            'type',
            'required',
            'options',
            'placeholder',
        ]);
    });

    it('GET /f/:slug returns empty fields for a form with no fields', async () => {
        const res = await request(app)
            .get(`/f/${form.slug}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            data: {
                name: form.name,
                fields: [],
            },
        });
    });

    it('GET /f/:slug returns 404 for a missing or deleted form', async () => {
        const missingRes = await request(app)
            .get('/f/nonexistent-slug-xyz');
        expect(missingRes.status).toBe(404);

        const user = await createTestUser();
        const project = await createTestProject(user.id);
        const deletedForm = await createTestForm(project.id);
        await prisma.form.update({
            where: { id: deletedForm.id },
            data: { deleted_at: new Date() },
        });

        const deletedRes = await request(app)
            .get(`/f/${deletedForm.slug}`);
        expect(deletedRes.status).toBe(404);
    });

    it('GET /f/:slug returns 403 for an inactive form', async () => {
        const user = await createTestUser();
        const project = await createTestProject(user.id);
        const inactiveForm = await createTestForm(project.id, { is_active: false });

        const res = await request(app)
            .get(`/f/${inactiveForm.slug}`);

        expect(res.status).toBe(403);
    });
});
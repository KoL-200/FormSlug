const request = require('supertest');
const app = require('../src/app');
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

describe('POST /projects/:projectId/forms/:formId/fields', () => {
    let project;
    let form;
    let token;
    let endpoint;

    beforeEach(async () => {
        const user = await createTestUser();
        project = await createTestProject(user.id);
        form = await createTestForm(project.id);
        token = await loginTestUser(app, user.email);
        endpoint = `/api/v1/projects/${project.id}/forms/${form.id}/fields`;
    });

    afterEach(async () => {
        await cleanDatabase();
    });

    const postField = (body) => request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .send(body);

    it('returns 400 when a SELECT field has no options', async () => {
        const response = await postField({ label: 'Choice', type: 'SELECT' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation failed');
    });

    it('returns 400 when the field type is invalid', async () => {
        const response = await postField({ label: 'Choice', type: 'WHATEVER' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation failed');
    });

    it('generates distinct keys when creating the same label twice', async () => {
        const firstResponse = await postField({ label: 'Phone', type: 'TEXT' });
        const secondResponse = await postField({ label: 'Phone', type: 'TEXT' });

        expect(firstResponse.status).toBe(201);
        expect(secondResponse.status).toBe(201);
        expect(firstResponse.body.data.key).toBe('phone');
        expect(secondResponse.body.data.key).toBe('phone_2');
    });

    it('persists required when it is true', async () => {
        const response = await postField({
            label: 'Phone',
            type: 'TEXT',
            required: true,
        });

        expect(response.status).toBe(201);
        expect(response.body.data.required).toBe(true);

        const field = await prisma.formField.findUnique({
            where: {
                form_id_key: {
                    form_id: form.id,
                    key: 'phone',
                },
            },
        });
        expect(field.required).toBe(true);
    });
});

describe('field mutations', () => {
    let user;
    let project;
    let form;
    let token;
    let endpoint;

    beforeEach(async () => {
        user = await createTestUser();
        project = await createTestProject(user.id);
        form = await createTestForm(project.id);
        token = await loginTestUser(app, user.email);
        endpoint = `/api/v1/projects/${project.id}/forms/${form.id}/fields`;
    });

    afterEach(async () => {
        await cleanDatabase();
        jest.restoreAllMocks();
    });

    const createFieldRecord = async (overrides = {}) => prisma.formField.create({
        data: {
            form_id: overrides.formId || form.id,
            key: overrides.key || `field_${Math.random().toString(36).slice(2, 8)}`,
            label: overrides.label || 'Field',
            type: overrides.type || 'TEXT',
            position: overrides.position ?? 0,
            required: overrides.required ?? false,
            placeholder: overrides.placeholder ?? null,
            options: overrides.options ?? null,
            deleted_at: overrides.deleted_at ?? null,
        },
    });

    const getFieldPositions = async () => {
        const fields = await prisma.formField.findMany({
            where: { form_id: form.id },
            orderBy: { position: 'asc' },
            select: { id: true, position: true },
        });

        return Object.fromEntries(fields.map((field) => [field.id, field.position]));
    };

    it('rejects a partial reorder list with a 409 and leaves positions unchanged', async () => {
        const a = await createFieldRecord({ key: 'a', label: 'A', position: 0 });
        const b = await createFieldRecord({ key: 'b', label: 'B', position: 1 });
        const c = await createFieldRecord({ key: 'c', label: 'C', position: 2 });

        const response = await request(app)
            .patch(`${endpoint}/reorder`)
            .set('Authorization', `Bearer ${token}`)
            .send({ order: [c.id, a.id] });

        expect(response.status).toBe(409);
        expect(response.body.error).toBe('field list changed, refresh');

        const positions = await getFieldPositions();
        expect(positions[a.id]).toBe(0);
        expect(positions[b.id]).toBe(1);
        expect(positions[c.id]).toBe(2);
    });

    it('rejects another user\'s field id without changing positions', async () => {
        const otherUser = await createTestUser({ email: 'other-user@example.com' });
        const otherProject = await createTestProject(otherUser.id);
        const otherForm = await createTestForm(otherProject.id);
        const foreignField = await createFieldRecord({
            formId: otherForm.id,
            key: 'foreign',
            label: 'Foreign',
            position: 0,
        });

        const a = await createFieldRecord({ key: 'a', label: 'A', position: 0 });
        const b = await createFieldRecord({ key: 'b', label: 'B', position: 1 });

        const response = await request(app)
            .patch(`${endpoint}/reorder`)
            .set('Authorization', `Bearer ${token}`)
            .send({ order: [foreignField.id, a.id, b.id] });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('One or more fields were not found');

        const positions = await getFieldPositions();
        expect(positions[a.id]).toBe(0);
        expect(positions[b.id]).toBe(1);
    });

    it('rejects duplicate ids and soft-deleted ids in reorder payloads', async () => {
        const a = await createFieldRecord({ key: 'a', label: 'A', position: 0 });
        const b = await createFieldRecord({ key: 'b', label: 'B', position: 1 });
        const deletedField = await createFieldRecord({
            key: 'z',
            label: 'Deleted',
            position: 99,
            deleted_at: new Date(),
        });

        const duplicateResponse = await request(app)
            .patch(`${endpoint}/reorder`)
            .set('Authorization', `Bearer ${token}`)
            .send({ order: [a.id, a.id, b.id] });

        expect(duplicateResponse.status).toBe(400);
        expect(duplicateResponse.body.error).toBe('Field ids must be unique');

        const softDeletedResponse = await request(app)
            .patch(`${endpoint}/reorder`)
            .set('Authorization', `Bearer ${token}`)
            .send({ order: [a.id, b.id, deletedField.id] });

        expect(softDeletedResponse.status).toBe(404);
        expect(softDeletedResponse.body.error).toBe('One or more fields were not found');
    });

    it('rolls back reorder updates when a transaction fails', async () => {
        const a = await createFieldRecord({ key: 'a', label: 'A', position: 0 });
        const b = await createFieldRecord({ key: 'b', label: 'B', position: 1 });

        const transactionSpy = jest.spyOn(prisma, '$transaction');
        transactionSpy.mockRejectedValueOnce(new Error('simulated transaction failure'));

        const response = await request(app)
            .patch(`${endpoint}/reorder`)
            .set('Authorization', `Bearer ${token}`)
            .send({ order: [b.id, a.id] });

        expect(response.status).toBe(500);

        const positions = await getFieldPositions();
        expect(positions[a.id]).toBe(0);
        expect(positions[b.id]).toBe(1);
    });

    it('rejects options on a TEXT field', async () => {
        const field = await createFieldRecord({ key: 'name', label: 'Name', position: 0, type: 'TEXT' });

        const response = await request(app)
            .patch(`${endpoint}/${field.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ options: ['One', 'Two'] });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Options are only allowed for SELECT fields');
    });

    it('deletes the same field twice with the second call as a 404', async () => {
        const field = await createFieldRecord({ key: 'email', label: 'Email', position: 0 });

        const firstResponse = await request(app)
            .delete(`${endpoint}/${field.id}`)
            .set('Authorization', `Bearer ${token}`);

        const secondResponse = await request(app)
            .delete(`${endpoint}/${field.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(firstResponse.status).toBe(200);
        expect(secondResponse.status).toBe(404);
        expect(secondResponse.body.error).toBe('Field not found');
    });
});

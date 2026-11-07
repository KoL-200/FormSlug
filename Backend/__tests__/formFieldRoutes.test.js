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

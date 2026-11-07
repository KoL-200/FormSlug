jest.mock('../src/config/database.Config', () => ({
    prisma: {
        formField: {
            findMany: jest.fn(),
            count: jest.fn(),
            aggregate: jest.fn(),
            create: jest.fn(),
        },
    },
}));

const { prisma } = require('../src/config/database.Config');
const { createField } = require('../src/services/formFieldServices/createField');
const { generateFieldKey } = require('../src/services/formFieldServices/generateFieldKey');
const { DANGEROUS_KEYS } = require('../src/utils/validateSubmissionEnvelope');
const { createFieldSchema } = require('../src/validators/FormFieldSchema/createField');

describe('generateFieldKey', () => {
    beforeEach(() => {
        prisma.formField.findMany.mockReset().mockResolvedValue([]);
        prisma.formField.count.mockReset().mockResolvedValue(0);
        prisma.formField.aggregate.mockReset().mockResolvedValue({ _max: { position: null } });
        prisma.formField.create.mockReset();
    });

    it('slugifies labels and falls back when a label has no slug characters', async () => {
        await expect(generateFieldKey('form-1', 'Phone number')).resolves.toBe('phone_number');
        await expect(generateFieldKey('form-1', '💡')).resolves.toBe('field');
        await expect(generateFieldKey('form-1', '電話')).resolves.toBe('field');
    });

    it('prefixes digit-leading and dangerous generated keys', async () => {
        await expect(generateFieldKey('form-1', '1st choice')).resolves.toBe('field_1st_choice');
        await expect(generateFieldKey('form-1', 'Constructor')).resolves.toBe('field_constructor');
        await expect(generateFieldKey('form-1', 'Prototype')).resolves.toBe('field_prototype');
        expect(DANGEROUS_KEYS.has('constructor')).toBe(true);
        expect(DANGEROUS_KEYS.has('prototype')).toBe(true);
    });

    it('checks existing keys, including soft-deleted fields, in one query', async () => {
        prisma.formField.findMany.mockResolvedValue([{ key: 'phone_number' }]);

        await expect(generateFieldKey('form-1', 'Phone number')).resolves.toBe('phone_number_2');
        expect(prisma.formField.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.formField.findMany).toHaveBeenCalledWith({
            where: { form_id: 'form-1' },
            select: { key: true },
        });
    });

    it('keeps generated keys within 40 characters, including collision suffixes', async () => {
        const label = 'a'.repeat(300);
        prisma.formField.findMany.mockResolvedValue([{ key: label.slice(0, 40) }]);

        const key = await generateFieldKey('form-1', label);

        expect(key).toHaveLength(40);
        expect(key.endsWith('_2')).toBe(true);
    });

    it('does not leave a trailing underscore when truncating a label', async () => {
        const label = `${'a'.repeat(39)} many words after the boundary`;

        const key = await generateFieldKey('form-1', label);

        expect(key).toHaveLength(39);
        expect(key.endsWith('_')).toBe(false);
    });

    it('creates a field with its generated key and provided attributes', async () => {
        const field = { id: 'field-1', key: 'phone_number' };
        prisma.formField.create.mockResolvedValue(field);

        await expect(createField({
            formId: 'form-1',
            label: 'Phone number',
            type: 'TEXT',
            required: true,
        })).resolves.toBe(field);

        expect(prisma.formField.create).toHaveBeenCalledWith({
            data: {
                form_id: 'form-1',
                label: 'Phone number',
                type: 'TEXT',
                key: 'phone_number',
                position: 0,
                required: true,
            },
        });
    });

    it('sets the next position based on all fields, including deleted ones', async () => {
        prisma.formField.aggregate.mockResolvedValue({ _max: { position: 7 } });
        prisma.formField.create.mockResolvedValue({ id: 'field-1', position: 8 });

        await createField({
            formId: 'form-1',
            label: 'Phone number',
            type: 'TEXT',
        });

        expect(prisma.formField.aggregate).toHaveBeenCalledWith({
            where: { form_id: 'form-1' },
            _max: { position: true },
        });
        expect(prisma.formField.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ position: 8 }),
        });
    });

    it('rejects when the form already has 40 active fields', async () => {
        prisma.formField.count.mockResolvedValue(40);

        await expect(createField({
            formId: 'form-1',
            label: 'Phone number',
            type: 'TEXT',
        })).rejects.toMatchObject({
            statusCode: 409,
            message: expect.stringContaining('40 active fields'),
        });
        expect(prisma.formField.count).toHaveBeenCalledWith({
            where: { form_id: 'form-1', deleted_at: null },
        });
        expect(prisma.formField.create).not.toHaveBeenCalled();
    });

    it('regenerates the key and retries a unique-key race twice', async () => {
        const existingKeys = new Set();
        let raceCount = 0;
        prisma.formField.findMany.mockImplementation(async () =>
            [...existingKeys].map((key) => ({ key })),
        );
        prisma.formField.create.mockImplementation(async ({ data }) => {
            if (raceCount < 2) {
                existingKeys.add(data.key);
                raceCount += 1;
                throw { code: 'P2002' };
            }
            return { id: 'field-1', key: data.key };
        });

        const field = await createField({
            formId: 'form-1',
            label: 'Phone number',
            type: 'TEXT',
        });

        expect(field.key).toBe('phone_number_3');
        expect(prisma.formField.findMany).toHaveBeenCalledTimes(3);
        expect(prisma.formField.create).toHaveBeenCalledTimes(3);
        expect(prisma.formField.create.mock.calls.map(([{ data }]) => data.key))
            .toEqual(['phone_number', 'phone_number_2', 'phone_number_3']);
    });

    it('returns a clear conflict after the retry limit and propagates other errors', async () => {
        prisma.formField.create.mockRejectedValue({ code: 'P2002' });

        await expect(createField({
            formId: 'form-1',
            label: 'Phone number',
            type: 'TEXT',
        })).rejects.toMatchObject({
            statusCode: 409,
            message: expect.stringContaining('key conflict'),
        });
        expect(prisma.formField.create).toHaveBeenCalledTimes(3);

        const databaseError = new Error('database unavailable');
        prisma.formField.create.mockRejectedValueOnce(databaseError);
        await expect(createField({
            formId: 'form-1',
            label: 'Phone number',
            type: 'TEXT',
        })).rejects.toBe(databaseError);
    });
});

describe('createFieldSchema', () => {
    it('trims labels and validates label length', () => {
        expect(createFieldSchema.parse({ label: ' Phone ', type: 'TEXT' }).label).toBe('Phone');
        const result = createFieldSchema.safeParse({
            label: 'a'.repeat(41),
            type: 'TEXT',
        });

        expect(result.success).toBe(false);
    });

    it('accepts and trims optional field attributes', () => {
        expect(createFieldSchema.parse({
            label: ' Name ',
            type: 'TEXT',
            required: true,
            placeholder: ' Enter name ',
        })).toMatchObject({
            label: 'Name',
            required: true,
            placeholder: 'Enter name',
        });
    });

    it('requires non-empty, unique SELECT options within the limits', () => {
        expect(createFieldSchema.safeParse({ label: 'Choice', type: 'SELECT', options: [] }).success).toBe(false);
        expect(createFieldSchema.safeParse({
            label: 'Choice',
            type: 'SELECT',
            options: [' Yes ', 'Yes'],
        }).success).toBe(false);
        expect(createFieldSchema.safeParse({
            label: 'Choice',
            type: 'SELECT',
            options: ['a'.repeat(101)],
        }).success).toBe(false);
        expect(createFieldSchema.safeParse({
            label: 'Choice',
            type: 'SELECT',
            options: Array.from({ length: 31 }, (_, index) => `Option ${index}`),
        }).success).toBe(false);
    });

    it('rejects invalid attributes and unexpected keys', () => {
        expect(createFieldSchema.safeParse({
            label: 'Choice',
            type: 'TEXT',
            options: ['A'],
        }).success).toBe(false);
        expect(createFieldSchema.safeParse({
            label: 'Name',
            type: 'TEXT',
            extra: true,
        }).success).toBe(false);
        expect(createFieldSchema.safeParse({
            label: '   ',
            type: 'TEXT',
        }).success).toBe(false);
    });
});

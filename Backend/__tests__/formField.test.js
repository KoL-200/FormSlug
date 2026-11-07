jest.mock('../src/config/database.Config', () => ({
    prisma: {
        formField: {
            findMany: jest.fn(),
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
                required: true,
            },
        });
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
    it('rejects labels longer than 40 characters', () => {
        const result = createFieldSchema.safeParse({
            label: 'a'.repeat(41),
            type: 'TEXT',
        });

        expect(result.success).toBe(false);
    });
});

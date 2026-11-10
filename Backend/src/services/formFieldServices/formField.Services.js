const { prisma } = require('../../config/database.Config');
const { ConflictError, BadRequestError, NotFoundError } = require('../../utils/AppError');
const { generateFieldKey } = require('./generateFieldKey');

const MAX_ACTIVE_FIELDS = 40;
const MAX_KEY_RETRIES = 2;

const listFields = async ({ formId, includeDeleted = false }) => prisma.formField.findMany({
    where: {
        form_id: formId,
        ...(includeDeleted ? {} : { deleted_at: null }),
    },
    orderBy: [
        { position: 'asc' },
        { created_at: 'asc' },
    ],
});

const updateField = async ({
    formId,
    fieldId,
    label,
    placeholder,
    required,
    options,
}) => {
    const field = await prisma.formField.findFirst({
        where: {
            id: fieldId,
            form_id: formId,
            deleted_at: null,
        },
    });

    if (!field) {
        throw new NotFoundError('Field not found');
    }

    if (options !== undefined && field.type !== 'SELECT') {
        throw new BadRequestError('Options are only allowed for SELECT fields');
    }

    const data = {};

    if (label !== undefined) data.label = label;
    if (placeholder !== undefined) data.placeholder = placeholder;
    if (required !== undefined) data.required = required;
    if (options !== undefined) data.options = options;

    if (Object.keys(data).length === 0) {
        throw new BadRequestError('At least one field is required');
    }

    return prisma.formField.updateMany({
        where: {
            id: fieldId,
            form_id: formId,
            deleted_at: null,
        },
        data,
    });
};

const deleteField = async ({ formId, fieldId }) => {
    const result = await prisma.formField.updateMany({
        where: {
            id: fieldId,
            form_id: formId,
            deleted_at: null,
        },
        data: {
            deleted_at: new Date(),
        },
    });

    if (result.count === 0) {
        throw new NotFoundError('Field not found');
    }

    return result;
};

const reorderFields = async ({ formId, order }) => {
    if (!Array.isArray(order) || order.length === 0) {
        throw new BadRequestError('Order must include at least one field id');
    }

    const activeFields = await prisma.formField.findMany({
        where: {
            form_id: formId,
            deleted_at: null,
        },
        select: { id: true },
    });

    const activeIds = new Set(activeFields.map((field) => field.id));

    if (new Set(order).size !== order.length) {
        throw new BadRequestError('Field ids must be unique');
    }

    const missing = order.filter((fieldId) => !activeIds.has(fieldId));

    if (missing.length > 0) {
        throw new NotFoundError('One or more fields were not found');
    }

    if (order.length !== activeIds.size) {
        throw new ConflictError('field list changed, refresh');
    }

    return prisma.$transaction(
        order.map((fieldId, index) => prisma.formField.updateMany({
            where: {
                id: fieldId,
                form_id: formId,
                deleted_at: null,
            },
            data: { position: index },
        })),
    );
};

const createField = async ({
    formId,
    label,
    type,
    options,
    required,
    placeholder,
}) => {
    const [activeFieldCount, highestPosition] = await Promise.all([
        prisma.formField.count({
            where: { form_id: formId, deleted_at: null },
        }),
        prisma.formField.aggregate({
            where: { form_id: formId },
            _max: { position: true },
        }),
    ]);

    if (activeFieldCount >= MAX_ACTIVE_FIELDS) {
        throw new ConflictError(`A form cannot have more than ${MAX_ACTIVE_FIELDS} active fields.`);
    }

    const data = {
        form_id: formId,
        label,
        type,
        position: (highestPosition._max.position ?? -1) + 1,
    };

    if (options !== undefined) data.options = options;
    if (required !== undefined) data.required = required;
    if (placeholder !== undefined) data.placeholder = placeholder;

    for (let attempt = 0; ; attempt += 1) {
        const key = await generateFieldKey(formId, label);

        try {
            return await prisma.formField.create({ data: { ...data, key } });
        } catch (error) {
            if (error.code !== 'P2002') {
                throw error;
            }

            if (attempt >= MAX_KEY_RETRIES) {
                throw new ConflictError('A field with this label could not be created due to a key conflict. Please try again.');
            }
        }
    }
};

module.exports = {
    createField,
    listFields,
    updateField,
    deleteField,
    reorderFields,
};

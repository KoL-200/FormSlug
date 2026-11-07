const { prisma } = require('../../config/database.Config');
const { ConflictError } = require('../../utils/AppError');
const { generateFieldKey } = require('./generateFieldKey');

const MAX_ACTIVE_FIELDS = 40;
const MAX_KEY_RETRIES = 2;

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

module.exports = { createField };

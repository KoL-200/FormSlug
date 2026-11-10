const { prisma } = require('../../config/database.Config');
const { activeFormBySlug } = require('./activeFormSlug.Services');
const { getCachedPublicForm, setCachedPublicForm } = require('../../utils/FormCache');
const { ForbiddenError, NotFoundError } = require('../../utils/AppError');

const legacyFieldTypes = {
    text: 'TEXT',
    textarea: 'TEXTAREA',
    email: 'EMAIL',
    select: 'SELECT',
    checkbox: 'CHECKBOX',
};

const mapLegacyFields = (fields = []) => {
    if (!Array.isArray(fields)) return [];

    const usedKeys = new Set();

    return fields.map((fieldValue, index) => {
        const field = fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)
            ? fieldValue
            : {};
        const idPart = String(field.id ?? index + 1).replace(/[^a-zA-Z0-9_-]/g, '_');
        const baseKey = `legacy_${idPart || index + 1}`;
        let key = baseKey;
        let suffix = 2;

        while (usedKeys.has(key)) {
            key = `${baseKey}_${suffix}`;
            suffix += 1;
        }
        usedKeys.add(key);

        const type = legacyFieldTypes[String(field.type || '').toLowerCase()] || 'TEXT';

        return {
            key,
            label: typeof field.label === 'string' ? field.label : '',
            type,
            required: Boolean(field.required),
            options: type === 'SELECT' && Array.isArray(field.options) ? field.options : null,
            placeholder: typeof field.placeholder === 'string' ? field.placeholder : null,
        };
    });
};

const getPublicFormBySlug = async (slug) => {
    const form = await activeFormBySlug(slug);

    if (!form) {
        throw new NotFoundError('Form not found');
    }

    if (!form.is_active) {
        throw new ForbiddenError('Form is inactive');
    }

    if (process.env.NODE_ENV !== 'test') {
        const cached = await getCachedPublicForm(slug);
        if (cached) return cached;
    }

    const storedFields = await prisma.formField.findMany({
        where: {
            form_id: form.id,
        },
        orderBy: [
            { position: 'asc' },
            { created_at: 'asc' },
        ],
        select: {
            key: true,
            label: true,
            type: true,
            required: true,
            options: true,
            placeholder: true,
            deleted_at: true,
        },
    });
    const fields = storedFields.length > 0
        ? storedFields.filter((field) => field.deleted_at === null)
        : mapLegacyFields(form.config?.fields);

    const payload = {
        success: true,
        data: {
            name: form.name,
            fields: fields.map((field) => ({
                key: field.key,
                label: field.label,
                type: field.type,
                required: field.required,
                options: field.options,
                placeholder: field.placeholder,
            })),
        },
    };

    if (process.env.NODE_ENV !== 'test') {
        await setCachedPublicForm(slug, payload);
    }

    return payload;
};

const getPublicFormFieldsBySlug = async (slug) => {
    const payload = await getPublicFormBySlug(slug);
    return payload.data.fields;
};

module.exports = { getPublicFormBySlug, getPublicFormFieldsBySlug };
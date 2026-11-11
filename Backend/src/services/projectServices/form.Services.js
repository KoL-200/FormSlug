const { prisma } = require('../../config/database.Config');
const { nanoid } = require('nanoid');
const { invalidateFormCache } = require('../../utils/FormCache');
const { redactForm, redactForms } = require('../../utils/redactForm')
const { BadRequestError } = require('../../utils/AppError');
const { uniqueFieldKey } = require('../../utils/fieldKey');

const FORM_FIELD_TYPES = {
    text: 'TEXT',
    textarea: 'TEXTAREA',
    email: 'EMAIL',
    select: 'SELECT',
    checkbox: 'CHECKBOX',
    TEXT: 'TEXT',
    TEXTAREA: 'TEXTAREA',
    EMAIL: 'EMAIL',
    SELECT: 'SELECT',
    CHECKBOX: 'CHECKBOX',
};

function prepareFormFields(fields) {
    if (!Array.isArray(fields)) {
        throw new BadRequestError('Form fields must be an array');
    }

    const usedKeys = new Set();

    return fields.map((field, position) => {
        if (!field || typeof field !== 'object' || Array.isArray(field)) {
            throw new BadRequestError('Invalid form field');
        }

        const label = typeof field.label === 'string' ? field.label.trim() : '';
        if (!label || label.length > 120) {
            throw new BadRequestError('Field labels must be between 1 and 120 characters');
        }

        const type = Object.hasOwn(FORM_FIELD_TYPES, field.type)
            ? FORM_FIELD_TYPES[field.type]
            : null;
        if (!type) {
            throw new BadRequestError('Unsupported form field type');
        }

        const data = {
            key: uniqueFieldKey(label, usedKeys),
            label,
            type,
            required: Boolean(field.required),
            placeholder: typeof field.placeholder === 'string' ? field.placeholder.trim() : null,
            position,
        };

        if (type === 'SELECT') {
            if (!Array.isArray(field.options) || field.options.length === 0 || field.options.length > 30) {
                throw new BadRequestError('SELECT fields require between 1 and 30 options');
            }
            data.options = field.options.map((option) => {
                if (typeof option !== 'string' || !option.trim() || option.trim().length > 100) {
                    throw new BadRequestError('SELECT options must be between 1 and 100 characters');
                }
                return option.trim();
            });
            if (new Set(data.options).size !== data.options.length) {
                throw new BadRequestError('SELECT options must be unique');
            }
        }

        return data;
    });
}

async function getUserEmail(userId) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
    });
}

const createForm = async ({ projectId, userId, name, notificationEmail, config = {} }) => {
    let resolvedNotificationEmail = notificationEmail;

    if (!resolvedNotificationEmail) {
        const user = await getUserEmail(userId);
        resolvedNotificationEmail = user?.email;
    }

    const slug = nanoid(10);
    const apiKey = nanoid(32);
    const fields = config.fields === undefined ? [] : prepareFormFields(config.fields);

    return prisma.form.create({
        data: {
            project_id: projectId,
            name,
            slug,
            api_key: apiKey,
            config,
            notification_email: resolvedNotificationEmail,
            ...(fields.length > 0 ? { formFields: { create: fields } } : {}),
        },
    });
}

const getFormById = async ({ formId, projectId }) => {
    const form = await prisma.form.findFirst({
        where: { id: formId, project_id: projectId, deleted_at: null },
    });
    return redactForm(form);
};

const getForms = async ({ projectId }) => {
    const forms = await prisma.form.findMany({
        where: {
            project_id: projectId,
            deleted_at: null,
        },
        orderBy: {
            created_at: 'desc',
        },
    });
    return redactForms(forms);
};

const updateForm = async ({ formId, name, notification_email, is_active }) => {
    const data = {};

    if (name !== undefined) data.name = name;
    if (notification_email !== undefined) data.notification_email = notification_email;
    if (is_active !== undefined) data.is_active = is_active;

    const form = await prisma.form.update({
        where: {
            id: formId,
        },
        data,
    });

    await invalidateFormCache(form.slug)
    return redactForm(form)
};

const deleteForm = async (formId) => {
    const form = await prisma.form.update({
        where: {
            id: formId,
        },
        data: {
            deleted_at: new Date(),
        },
    });

    await invalidateFormCache(form.slug)
    return form
};

module.exports = {
    createForm,
    getFormById,
    getForms,
    updateForm,
    deleteForm,
};
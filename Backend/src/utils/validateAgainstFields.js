const { z } = require('zod');

const MAX_TEXT_LENGTH = 1000;
const MAX_TEXTAREA_LENGTH = 5000;
const emailSchema = z.string().email();

const validateAgainstFields = (fields, body) => {
    if (fields.length === 0) {
        return { data: body };
    }

    const data = {};
    const errors = [];

    for (const field of fields) {
        const hasValue = Object.hasOwn(body, field.key);
        const value = body[field.key];
        const isEmpty = !hasValue || value === null || (typeof value === 'string' && value.trim() === '');

        if (field.required && (isEmpty || (field.type === 'CHECKBOX' && value === false))) {
            errors.push({ field: field.key, message: 'This field is required.' });
            continue;
        }

        if (!hasValue || (typeof value === 'string' && value.trim() === '')) continue;

        if (field.type === 'TEXT' || field.type === 'TEXTAREA') {
            const maxLength = field.type === 'TEXT' ? MAX_TEXT_LENGTH : MAX_TEXTAREA_LENGTH;
            if (typeof value !== 'string') {
                errors.push({ field: field.key, message: 'Must be a string.' });
            } else if (value.length > maxLength) {
                errors.push({ field: field.key, message: `Must be at most ${maxLength} characters.` });
            } else {
                data[field.key] = value;
            }
            continue;
        }

        if (field.type === 'EMAIL') {
            if (typeof value !== 'string' || !emailSchema.safeParse(value).success) {
                errors.push({ field: field.key, message: 'Enter a valid email address.' });
            } else {
                data[field.key] = value;
            }
            continue;
        }

        if (field.type === 'SELECT') {
            if (typeof value !== 'string' || !Array.isArray(field.options) || !field.options.includes(value)) {
                errors.push({ field: field.key, message: 'Select a valid option.' });
            } else {
                data[field.key] = value;
            }
            continue;
        }

        if (field.type === 'CHECKBOX') {
            if (typeof value !== 'boolean') {
                errors.push({ field: field.key, message: 'Must be a boolean.' });
            } else {
                data[field.key] = value;
            }
            continue;
        }

        errors.push({ field: field.key, message: 'This field type is not supported.' });
    }

    return errors.length > 0 ? { errors } : { data };
};

module.exports = {
    MAX_TEXT_LENGTH,
    MAX_TEXTAREA_LENGTH,
    validateAgainstFields,
};
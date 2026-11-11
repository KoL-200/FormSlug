const { uniqueFieldKey } = require('./fieldKey');

const legacyFieldTypes = {
    text: 'TEXT',
    textarea: 'TEXTAREA',
    email: 'EMAIL',
    select: 'SELECT',
    checkbox: 'CHECKBOX',
};

const mapLegacyFormFields = (fields = []) => {
    if (!Array.isArray(fields)) return [];

    const usedKeys = new Set();

    return fields.map((fieldValue, index) => {
        const field = fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)
            ? fieldValue
            : {};
        const idPart = String(field.id ?? index + 1).replace(/[^a-zA-Z0-9_-]/g, '_');
        const label = typeof field.label === 'string' ? field.label : '';
        const key = uniqueFieldKey(label, usedKeys);
        const typeName = String(field.type || '').toLowerCase();
        const type = Object.hasOwn(legacyFieldTypes, typeName) ? legacyFieldTypes[typeName] : 'TEXT';

        return {
            key,
            legacyKey: `legacy_${idPart || index + 1}`,
            label,
            type,
            required: Boolean(field.required),
            options: type === 'SELECT' && Array.isArray(field.options) ? field.options : null,
            placeholder: typeof field.placeholder === 'string' ? field.placeholder : null,
        };
    });
};

module.exports = { mapLegacyFormFields };

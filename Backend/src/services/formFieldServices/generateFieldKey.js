const { prisma } = require('../../config/database.Config');
const { BadRequestError } = require('../../utils/AppError');

const RESERVED_KEYS = new Set(['__proto__', '_gotcha']);

const slugifyLabel = (label) => label
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const generateFieldKey = async (formId, label) => {
    if (typeof formId !== 'string' || formId.length === 0) {
        throw new BadRequestError('A form ID is required');
    }

    if (typeof label !== 'string') {
        throw new BadRequestError('A field label is required');
    }

    if (RESERVED_KEYS.has(label.trim().toLowerCase())) {
        throw new BadRequestError('This field label is reserved');
    }

    let baseKey = slugifyLabel(label) || 'field';

    if (/^\d/.test(baseKey)) {
        baseKey = `field_${baseKey}`;
    }

    let key = baseKey;
    let suffix = 2;

    while (await prisma.formField.findFirst({
        where: { form_id: formId, key },
        select: { id: true },
    })) {
        key = `${baseKey}_${suffix}`;
        suffix += 1;
    }

    return key;
};

module.exports = { generateFieldKey };
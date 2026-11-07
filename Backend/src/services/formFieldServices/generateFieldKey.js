const { prisma } = require('../../config/database.Config');
const { BadRequestError } = require('../../utils/AppError');
const { DANGEROUS_KEYS } = require('../../utils/validateSubmissionEnvelope');

const MAX_FIELD_KEY_LENGTH = 40;

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

    let baseKey = slugifyLabel(label) || 'field';

    if (/^\d/.test(baseKey) || DANGEROUS_KEYS.has(baseKey)) {
        baseKey = `field_${baseKey}`;
    }

    baseKey = baseKey.slice(0, MAX_FIELD_KEY_LENGTH).replace(/_+$/, '');
    let key = baseKey;
    let suffix = 2;
    const existingKeys = await prisma.formField.findMany({
        where: { form_id: formId },
        select: { key: true },
    });
    const keys = new Set(existingKeys.map(({ key: existingKey }) => existingKey));

    while (keys.has(key)) {
        const suffixText = `_${suffix}`;
        if (suffixText.length >= MAX_FIELD_KEY_LENGTH) {
            throw new BadRequestError('Unable to generate a unique field key');
        }
        const truncatedBase = baseKey
            .slice(0, MAX_FIELD_KEY_LENGTH - suffixText.length)
            .replace(/_+$/, '');
        key = `${truncatedBase}${suffixText}`;
        suffix += 1;
    }

    return key;
};

module.exports = { generateFieldKey };
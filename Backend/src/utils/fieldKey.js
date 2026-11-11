const { BadRequestError } = require('./AppError');
const { DANGEROUS_KEYS } = require('./validateSubmissionEnvelope');

const MAX_FIELD_KEY_LENGTH = 40;

function getFieldKeyBase(label) {
    let baseKey = label
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'field';

    if (/^\d/.test(baseKey) || DANGEROUS_KEYS.has(baseKey)) {
        baseKey = `field_${baseKey}`;
    }

    return baseKey.slice(0, MAX_FIELD_KEY_LENGTH).replace(/_+$/, '') || 'field';
}

function uniqueFieldKey(label, usedKeys) {
    const baseKey = getFieldKeyBase(label);
    let key = baseKey;
    let suffix = 2;

    while (usedKeys.has(key)) {
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

    usedKeys.add(key);
    return key;
}

module.exports = { getFieldKeyBase, uniqueFieldKey };

const { BadRequestError } = require('./AppError');

const MAX_SUBMISSION_FIELDS = 50;
const MAX_SUBMISSION_VALUE_LENGTH = 10_000;
const MAX_DEPTH = 5;
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value) {
    if (value === null || typeof value !== 'object') return false;

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function sanitizeAndValidate(value, depth = 0) {
    if (depth >= MAX_DEPTH) {
        throw new BadRequestError('Submission is nested too deeply');
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            sanitizeAndValidate(item, depth + 1);
        }
        return value;
    }

    if (isPlainObject(value)) {
        if (Object.keys(value).length > MAX_SUBMISSION_FIELDS) {
            throw new BadRequestError(`Submission cannot contain more than ${MAX_SUBMISSION_FIELDS} fields`);
        }

        for (const key of Object.keys(value)) {
            if (DANGEROUS_KEYS.has(key)) {
                delete value[key];
                continue;
            }
            sanitizeAndValidate(value[key], depth + 1);
        }
        return value;
    }

    if (typeof value === 'string' && value.length > MAX_SUBMISSION_VALUE_LENGTH) {
        throw new BadRequestError(
            `Submission field values cannot exceed ${MAX_SUBMISSION_VALUE_LENGTH} characters`,
        );
    }

    return value;
}

function validateSubmissionEnvelope(body) {
    if (!isPlainObject(body)) {
        throw new BadRequestError('Submission body must be a plain object');
    }

    return sanitizeAndValidate(body);
}

module.exports = {
    MAX_SUBMISSION_FIELDS,
    MAX_SUBMISSION_VALUE_LENGTH,
    sanitizeAndValidate,
    validateSubmissionEnvelope,
};
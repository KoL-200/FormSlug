const {
    MAX_DEPTH,
    MAX_SUBMISSION_VALUE_LENGTH,
    validateSubmissionEnvelope,
} = require('./src/utils/validateSubmissionEnvelope');

const body = {
    profile: {
        constructor: 'remove',
        contacts: [{ prototype: 'remove', label: 'ok' }],
    },
};

if (validateSubmissionEnvelope(body) !== body) throw new Error('root identity was not preserved');
if (Object.prototype.hasOwnProperty.call(body.profile, 'constructor')) throw new Error('nested key was not removed');
if (Object.prototype.hasOwnProperty.call(body.profile.contacts[0], 'prototype')) throw new Error('array object key was not removed');

let tooDeep = { value: 'ok' };
for (let depth = 0; depth <= MAX_DEPTH; depth += 1) tooDeep = { next: tooDeep };
try {
    validateSubmissionEnvelope(tooDeep);
    throw new Error('deep payload was accepted');
} catch (error) {
    if (error.message === 'deep payload was accepted') throw error;
}

try {
    validateSubmissionEnvelope({ nested: { value: 'x'.repeat(MAX_SUBMISSION_VALUE_LENGTH + 1) } });
    throw new Error('nested long value was accepted');
} catch (error) {
    if (error.message === 'nested long value was accepted') throw error;
}

console.log('recursive submission envelope checks pass');

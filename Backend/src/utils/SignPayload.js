const crypto = require('crypto');

function signPayload(payloadString, secret) {
    return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
}

module.exports = signPayload
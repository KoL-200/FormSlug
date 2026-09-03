const ms = require('ms');

function parseDuration(str) {
    return ms(str);
}

module.exports = { parseDuration };
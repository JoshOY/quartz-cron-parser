const assert = require('node:assert/strict');
const { parse, validate } = require('@joshoy/quartz-cron-parser');

const expression = '0 0 12 ? * MON-FRI';

assert.equal(validate(expression), true);
assert.equal(parse(expression).error, null);

console.log('CommonJS package export passed');

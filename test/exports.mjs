import assert from 'node:assert/strict';
import { parse, validate } from '@joshoy/quartz-cron-parser';

const expression = '0 0 12 ? * MON-FRI';

assert.equal(validate(expression), true);
assert.equal(parse(expression).error, null);

console.log('ES module package export passed');

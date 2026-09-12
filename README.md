# Quartz Cron Parser

[![npm version](https://img.shields.io/npm/v/%40joshoy%2Fquartz-cron-parser.svg)](https://www.npmjs.com/package/@joshoy/quartz-cron-parser)
[![npm downloads](https://img.shields.io/npm/dm/%40joshoy%2Fquartz-cron-parser.svg)](https://www.npmjs.com/package/@joshoy/quartz-cron-parser)
[![license](https://img.shields.io/npm/l/%40joshoy%2Fquartz-cron-parser.svg)](./LICENSE)

`@joshoy/quartz-cron-parser` parses and validates Quartz cron expressions.
It returns structured data for each cron field. It does not schedule jobs.

## Installation

Install the package with npm:

```bash
npm install @joshoy/quartz-cron-parser
```

Or install it with Yarn:

```bash
yarn add @joshoy/quartz-cron-parser
```

## Basic usage

The package supports ES modules and CommonJS.

Use an ES module import:

```javascript
import { parse, validate } from '@joshoy/quartz-cron-parser';
```

Or use CommonJS:

```javascript
const { parse, validate } = require('@joshoy/quartz-cron-parser');
```

### Validate an expression

Use `validate()` when you only need a Boolean result.

```javascript
import { validate } from '@joshoy/quartz-cron-parser';

validate('0 0 12 ? * MON-FRI'); // true
validate('0 0 12 * * MON');     // false
```

The second expression specifies both day fields. This expression is invalid.
Set the day-of-month field or the day-of-week field to `?`.

### Parse an expression

Use `parse()` when you need the value and mode of each field.

```javascript
import { parse } from '@joshoy/quartz-cron-parser';

const parsed = parse('0 0 12 ? * MON-FRI');

if (parsed.error) {
  console.error(parsed.error.message);
} else {
  console.log(parsed.result);
}
```

The result has this structure:

```javascript
[
  { field: 'seconds', mode: 'specific', value: 0 },
  { field: 'minutes', mode: 'specific', value: 0 },
  { field: 'hours', mode: 'specific', value: 12 },
  { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
  { field: 'month', mode: 'every', value: '*' },
  { field: 'dayOfWeek', mode: 'range', value: [2, 6] }
]
```

The package includes TypeScript declarations:

```typescript
import { parse, validate } from '@joshoy/quartz-cron-parser';
```

## Quartz cron format

An expression has six required fields and one optional year field.
Separate fields with one or more spaces or tabs.

```text
┌──────────── second (0-59)
│ ┌────────── minute (0-59)
│ │ ┌──────── hour (0-23)
│ │ │ ┌────── day of month (1-31)
│ │ │ │ ┌──── month (1-12 or JAN-DEC)
│ │ │ │ │ ┌── day of week (1-7 or SUN-SAT)
│ │ │ │ │ │ ┌ year (1970-2099, optional)
│ │ │ │ │ │ │
* * * * * * *
```

Sunday is day `1`. Saturday is day `7`. Month names and weekday names are
not case-sensitive.

Set exactly one of the day-of-month and day-of-week fields to `?`.

### Special characters

| Character | Use |
| --- | --- |
| `*` | Match every value. |
| `?` | Leave the day-of-month or day-of-week field unspecified. |
| `,` | Separate items in a list, for example `MON,WED,FRI`. |
| `-` | Define a range, for example `MON-FRI` or `NOV-FEB`. |
| `/` | Define an increment, for example `0/15` or `0-30/10`. An increment can be a list item. |
| `L` | Select the last day of the month. In the day-of-week field, `L` means Saturday. |
| `L-n` | Select a day before the last day of the month, for example `L-2`. |
| `L-nW` | Select the weekday nearest to a day relative to the end of the month, for example `L-2W`. |
| `LW` | Select the last weekday of the month. |
| `nW` | Select the weekday nearest to day `n`, for example `15W`. |
| `nL` | Select the last specified weekday of the month, for example `FRIL`. |
| `n#x` | Select occurrence `x` of weekday `n`, for example `FRI#3`. |

Lists can contain ranges and increments. The parser converts `1,4-7` to
`[1, 4, 5, 6, 7]`. It converts `0/15,59` to `[0, 15, 30, 45, 59]`.

Quartz 2.5.2 permits special day-of-month values in lists. For example,
`5,15,L` selects the 5th, the 15th, and the last day of the month.
`L-1W,L-1` selects the weekday nearest to the day before month-end and the
day before month-end. `2W,16` selects the weekday nearest to the 2nd and the
16th.

An overflowing range wraps at the field boundary. For example, `NOV-FEB`
wraps from December to January. In a list, it expands to `[11, 12, 1, 2]`.

### Examples

| Expression | Meaning |
| --- | --- |
| `0 * * ? * *` | At second 0 of every minute. |
| `0 0 12 ? * MON-FRI` | At 12:00 from Monday through Friday. |
| `0 0 9 15W * ?` | At 09:00 on the weekday nearest to the 15th. |
| `0 0 9 LW * ?` | At 09:00 on the last weekday of the month. |
| `0 0 9 L-2 * ?` | At 09:00 two days before the last day of the month. |
| `0 0 9 L-2W * ?` | At 09:00 on the weekday nearest to two days before month-end. |
| `0 0 9 L-1W,L-1 * ?` | At 09:00 on the weekday nearest to the day before month-end and on the day before month-end. |
| `0 0-30/10 12 ? * *` | At 12:00, 12:10, 12:20, and 12:30. |
| `0 0 12 5,15,L * ?` | At 12:00 on the 5th, the 15th, and the last day of the month. |
| `0 0 9 ? * FRI#3` | At 09:00 on the third Friday of the month. |
| `0 15 10 ? JAN MON-FRI 2026` | At 10:15 on weekdays in January 2026. |

## API

### `validate(cronExpression)`

`validate()` returns `true` when the expression is valid. It returns `false`
when the expression is invalid.

```typescript
function validate(cronExpression: string): boolean;
```

### `parse(cronExpression, throwErrorDirectly)`

`parse()` parses the expression. It returns a `QuartzCronValidationResult`
object.

```typescript
function parse(
  cronExpression: string,
  throwErrorDirectly?: boolean
): QuartzCronValidationResult;
```

The default value of `throwErrorDirectly` is `false`.

- For a valid expression, `result` contains the parsed fields. `error` is
  `null`.
- For an invalid expression, `result` is `null`. `error` contains an `Error`
  object.
- When `throwErrorDirectly` is `true`, `parse()` throws the parsing or
  validation error.

```javascript
try {
  const parsed = parse('0 0 12 * * MON', true);
  console.log(parsed.result);
} catch (error) {
  console.error(error.message);
}
```

Each item in `result` has these properties:

| Property | Description |
| --- | --- |
| `field` | The cron field name. |
| `mode` | The syntax mode, such as `every`, `range`, or `rangeIncrement`. |
| `value` | The parsed value for the selected mode. |

A range increment preserves its start, end, and interval:

```javascript
{ field: 'minutes', mode: 'rangeIncrement', value: [0, 30, 10] }
```

A list that contains `L` preserves each item because the list mixes numeric
and last-day semantics:

```javascript
{
  field: 'dayOfMonth',
  mode: 'list',
  value: [
    { mode: 'specific', value: 5 },
    { mode: 'specific', value: 15 },
    { mode: 'daysBeforeEndOfMonth', value: 0 }
  ]
}
```

`L-nW` uses `nearestWeekdayBeforeEndOfMonth`. The value is the offset from
the last day of the month:

```javascript
{
  field: 'dayOfMonth',
  mode: 'nearestWeekdayBeforeEndOfMonth',
  value: 2
}
```

## Development

Use Node.js 22 and Yarn 1.22.22.

```bash
nvm use
corepack enable
yarn install --frozen-lockfile
yarn build
yarn test --runInBand
yarn test:exports
yarn test:types
yarn test:package
```

## License

This project uses the [MIT License](./LICENSE).

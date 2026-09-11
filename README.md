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

### Validate an expression

Use `validate()` when you only need a Boolean result.

```javascript
const { validate } = require('@joshoy/quartz-cron-parser');

validate('0 0 12 ? * MON-FRI'); // true
validate('0 0 12 * * MON');     // false
```

The second expression specifies both day fields. This expression is invalid.
Set the day-of-month field or the day-of-week field to `?`.

### Parse an expression

Use `parse()` when you need the value and mode of each field.

```javascript
const { parse } = require('@joshoy/quartz-cron-parser');

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

The package includes TypeScript declarations. You can also use named imports:

```typescript
import { parse, validate } from '@joshoy/quartz-cron-parser';
```

## Quartz cron format

An expression has six required fields and one optional year field.

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
| `-` | Define a range, for example `MON-FRI`. |
| `/` | Define an increment, for example `0/15`. |
| `L` | Select the last day of the month. |
| `L-n` | Select a day before the last day of the month, for example `L-2`. |
| `LW` | Select the last weekday of the month. |
| `nW` | Select the weekday nearest to day `n`, for example `15W`. |
| `nL` | Select the last specified weekday of the month, for example `FRIL`. |
| `n#x` | Select occurrence `x` of weekday `n`, for example `FRI#3`. |

Lists can contain ranges. For example, the parser converts `1,4-7` to
`[1, 4, 5, 6, 7]`.

### Examples

| Expression | Meaning |
| --- | --- |
| `0 * * ? * *` | At second 0 of every minute. |
| `0 0 12 ? * MON-FRI` | At 12:00 from Monday through Friday. |
| `0 0 9 15W * ?` | At 09:00 on the weekday nearest to the 15th. |
| `0 0 9 LW * ?` | At 09:00 on the last weekday of the month. |
| `0 0 9 L-2 * ?` | At 09:00 two days before the last day of the month. |
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
| `mode` | The syntax mode, such as `every` or `range`. |
| `value` | The parsed number, number array, `*`, or `?`. |

## Development

Use Node.js 22 and Yarn 1.22.22.

```bash
nvm use
corepack enable
yarn install --frozen-lockfile
yarn test --runInBand
yarn build
```

## License

This project uses the [MIT License](./LICENSE).

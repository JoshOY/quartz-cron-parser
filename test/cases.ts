import { QuartzCronField, QuartzCronValidationResult } from '../src/index';

export type Case = [string, QuartzCronValidationResult];

const fields: QuartzCronField['field'][] = ['seconds', 'minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek', 'years'];

function expression(index: number, value: string): string {
  const parts = ['0', '0', '12', '?', '*', '*', '*'];
  if (index === 3) parts[5] = '?';
  parts[index] = value;
  return parts.join(' ');
}

function listCase(index: number, input: string, value: number[]): Case {
  const result: QuartzCronField[] = [
    { field: 'seconds', mode: 'specific', value: 0 },
    { field: 'minutes', mode: 'specific', value: 0 },
    { field: 'hours', mode: 'specific', value: 12 },
    { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
    { field: 'month', mode: 'every', value: '*' },
    { field: 'dayOfWeek', mode: 'every', value: '*' },
    { field: 'years', mode: 'every', value: '*' },
  ];
  if (index === 3) result[5] = { field: 'dayOfWeek', mode: 'noSpecific', value: '?' };
  result[index] = { field: fields[index], mode: 'specific', value };
  return [expression(index, input), { error: null, result }];
}

const listPatterns: [string, number[]][] = [
  ['1,2,4-7', [1, 2, 4, 5, 6, 7]],
  ['1-2,4,6-7', [1, 2, 4, 6, 7]],
  ['1-2,4-7', [1, 2, 4, 5, 6, 7]],
  ['4-7,1,2', [4, 5, 6, 7, 1, 2]],
  ['1,2-2', [1, 2]],
  ['1,1-2', [1, 1, 2]],
];

const listCases: Case[] = fields.reduce<Case[]>((cases, field, index) => {
  const offset = index === 6 ? 1970 : 0;
  return cases.concat(listPatterns.map(([input, expected]) => listCase(
    index,
    input.replace(/\d+/g, value => String(Number(value) + offset)),
    expected.map(value => value + offset),
  )));
}, []);

const invalidListFields: [number, string][] = [
  [0, '1,58-60'], [0, '0-60/10'], [1, '1,60-61'], [2, '1,23-24'],
  [3, '1,0-2'], [3, '1,30-32'], [4, '1,11-13'],
  [5, '1,6-8'],
  [6, '1970,2098-2100'], [6, '1970,1968-1969'], [6, '1969-2000/10'],
  [0, '1,,4-7'], [0, '1,4-7,'],
  [5, 'MON,FRIL'], [5, 'MON,FRI#3'],
];

export const invalidCases: string[] = invalidListFields.map(([index, input]) => expression(index, input));

export const parseableCases: Case[] = [
  ...listCases,
  [
    '0\t0\t12\t?\t*\tMON-FRI',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'range', value: [2, 6] },
      ],
    },
  ],
  listCase(4, 'JAN,MAR-MAY', [1, 3, 4, 5]),
  listCase(4, 'MAR-MAY,1,JUN', [3, 4, 5, 1, 6]),
  listCase(5, 'MON,WED-FRI', [2, 4, 5, 6]),
  listCase(5, 'mon-wed,7', [2, 3, 4, 7]),
  listCase(2, '1,20-23', [1, 20, 21, 22, 23]),
  listCase(3, '1,29-31', [1, 29, 30, 31]),
  listCase(2, '22-2,12', [22, 23, 0, 1, 2, 12]),
  listCase(4, 'JAN,JUN-FEB', [1, 6, 7, 8, 9, 10, 11, 12, 1, 2]),
  listCase(5, 'MON,FRI-WED', [2, 6, 7, 1, 2, 3, 4]),
  listCase(0, '0/15,59', [0, 15, 30, 45, 59]),
  listCase(1, '1,10/20', [1, 10, 30, 50]),
  listCase(2, '1/10,23', [1, 11, 21, 23]),
  listCase(3, '1/10,30', [1, 11, 21, 31, 30]),
  listCase(4, 'JAN/5,DEC', [1, 6, 11, 12]),
  listCase(5, 'MON/2,SAT', [2, 4, 6, 7]),
  listCase(6, '2098/1,1970', [2098, 2099, 1970]),
  [
    '* * * ? * *',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'every', value: '*' },
        { field: 'minutes', mode: 'every', value: '*' },
        { field: 'hours', mode: 'every', value: '*' },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
      ],
    },
  ],
  [
    '0 0 12 ? * SAT *',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'specific', value: 7 },  // Day of week starts at Sunday = 1
        { field: 'years', mode: 'every', value: '*' },
      ],
    },
  ],
  [
    '4,0,1,2 0 12 ? JAN,JUN *',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: [4, 0, 1, 2] },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'specific', value: [1,6] },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
      ],
    },
  ],
  [
    '0 0 12 ? JAN-JUN *',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'range', value: [1,6] },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
      ],
    },
  ],
  [
    '0 0 12 ? JUN-FEB *',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'range', value: [6, 2] },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
      ],
    },
  ],
  [
    '0 0 22-2 ? * *',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'range', value: [22, 2] },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
      ],
    },
  ],
  [
    '0 0 12 ? * FRI-MON',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'range', value: [6, 2] },
      ],
    },
  ],
  [
    '0 0 12 ? * L',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'specific', value: 7 },
      ],
    },
  ],
  [
    '0 0 12 ? * MON,SAT',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'specific', value: [2,7] },  // Day of week starts at Sunday = 1
      ],
    },
  ],
  [
    '0 0 12 ? * TUE-FRI',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'range', value: [3, 6] },  // Day of week starts at Sunday = 1
      ],
    },
  ],
  [
    '0 0,30 2,1 ? DEC *',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: [0,30] },
        { field: 'hours', mode: 'specific', value: [2,1] },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'specific', value: 12 },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
      ],
    },
  ],
  [
    '0/3 0/2 0/23 ? * *',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'increment', value: [0,3] },
        { field: 'minutes', mode: 'increment', value: [0,2] },
        { field: 'hours', mode: 'increment', value: [0,23] },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
      ],
    },
  ],
  [
    '0-3 1-5 0-23 ? * * 1970-2099',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'range', value: [0,3] },
        { field: 'minutes', mode: 'range', value: [1,5] },
        { field: 'hours', mode: 'range', value: [0,23] },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
        { field: 'years', mode: 'range', value: [1970,2099] },
      ],
    },
  ],
  [
    '0 0 12 ? * * 2099/1',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
        { field: 'years', mode: 'increment', value: [2099, 1] },
      ],
    },
  ],
  [
    '* * * L-1 * ?',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'every', value: '*' },
        { field: 'minutes', mode: 'every', value: '*' },
        { field: 'hours', mode: 'every', value: '*' },
        { field: 'dayOfMonth', mode: 'daysBeforeEndOfMonth', value: 1 },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'noSpecific', value: '?' },
      ],
    },
  ],
  [
    // Nearest weekday (Monday to Friday) to the 1st of the month
    '* * * 31W * ?',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'every', value: '*' },
        { field: 'minutes', mode: 'every', value: '*' },
        { field: 'hours', mode: 'every', value: '*' },
        { field: 'dayOfMonth', mode: 'nearestWeekdayOfMonth', value: 31 },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'noSpecific', value: '?' },
      ],
    },
  ],
  [
    //  On the 2st Sunday of the month
    '* * * ? * 1#2',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'every', value: '*' },
        { field: 'minutes', mode: 'every', value: '*' },
        { field: 'hours', mode: 'every', value: '*' },
        { field: 'dayOfMonth',  mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'nthWeekDayOfMonth', value: [1, 2] },
      ],
    },
  ],
  [
    // Every two days of the week, starting on Friday
    '* * * ? * FRI/2',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'every', value: '*' },
        { field: 'minutes', mode: 'every', value: '*' },
        { field: 'hours', mode: 'every', value: '*' },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'increment', value: [6, 2] },
      ],
    },
  ],
  [
    // Every two months, starting in February
    '* * * ? FEB/2 *',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'every', value: '*' },
        { field: 'minutes', mode: 'every', value: '*' },
        { field: 'hours', mode: 'every', value: '*' },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'increment', value: [2, 2] },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
      ],
    },
  ],
  [
    // The last Friday of the month
    '* * * ? * FRIL',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'every', value: '*' },
        { field: 'minutes', mode: 'every', value: '*' },
        { field: 'hours', mode: 'every', value: '*' },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'dayOfWeekBeforeEndOfMonth', value: 6 },
      ],
    },
  ],
  [
    // The third Friday of the month
    '* * * ? * FRI#3',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'every', value: '*' },
        { field: 'minutes', mode: 'every', value: '*' },
        { field: 'hours', mode: 'every', value: '*' },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'nthWeekDayOfMonth', value: [6, 3] },
      ],
    },
  ],
  [
    '*/2 */3 */4 */5 */6 ? */1',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'increment', value: [0,2] },
        { field: 'minutes', mode: 'increment', value: [0,3] },
        { field: 'hours', mode: 'increment', value: [0,4] },
        { field: 'dayOfMonth', mode: 'increment', value: [1,5] },
        { field: 'month', mode: 'increment', value: [1,6] },
        { field: 'dayOfWeek', mode: 'noSpecific', value: '?' },
        { field: 'years', mode: 'increment', value: [1970,1] },
      ],
    },
  ],
  // https://github.com/JoshOY/quartz-cron-parser/issues/3
  [
    '0 20 10-12 * * ? *',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 20 },
        { field: 'hours', mode: 'range', value: [10,12] },
        { field: 'dayOfMonth', mode: 'every', value: '*' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'noSpecific', value: '?' },
        { field: 'years', mode: 'every', value: '*' },
      ],
    },
  ],
  [
    '0 20 10-33 * * ? *',
    {
      error: new Error('(Hours) Unsupported value \'10-33\' for range. Accepted values are 0-23'),
      result: null,
    },
  ],
];

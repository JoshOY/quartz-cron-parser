import { QuartzCronValidationResult } from '../src/index';

export type Case = [string, QuartzCronValidationResult];

export const parseableCases: Case[] = [
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
      error: new Error('(Months) Unsupported value \'6-2\' for range. Accepted values are 1-12'),
      result: null,
    }
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

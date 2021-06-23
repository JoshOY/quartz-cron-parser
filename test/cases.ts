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
    '0-3 1-5 0-23 ? * * 1970-2021',
    {
      error: null,
      result: [
        { field: 'seconds', mode: 'range', value: [0,3] },
        { field: 'minutes', mode: 'range', value: [1,5] },
        { field: 'hours', mode: 'range', value: [0,23] },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
        { field: 'years', mode: 'range', value: [1970,2021] },
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
];

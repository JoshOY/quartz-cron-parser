import { parse, validate, QuartzCronValidationResult } from '../src/index';
import { parseableCases, invalidCases } from './cases';

describe('Parser should work correctly when cron expression is valid', () => {
  test.each(parseableCases)(`Expression %p should be parsed as expected`, (input: string, expectedResult: QuartzCronValidationResult) => {
    const parserOutput = parse(input);
    expect(parserOutput).toStrictEqual(expectedResult);
  });
});

describe('Parser rejects invalid expressions', () => {
  test.each(invalidCases)('Expression %p should be rejected', (input: string) => {
    expect(validate(input)).toBe(false);
    expect(parse(input).result).toBeNull();
    expect(() => parse(input, true)).toThrow();
  });
});

describe('Parser supports Quartz range increments', () => {
  test('preserves range increments for every numeric field', () => {
    expect(parse('0-30/10 0-45/15 1-23/11 1-31/10 1-12/5 ? 1970-2099/50')).toStrictEqual({
      error: null,
      result: [
        { field: 'seconds', mode: 'rangeIncrement', value: [0, 30, 10] },
        { field: 'minutes', mode: 'rangeIncrement', value: [0, 45, 15] },
        { field: 'hours', mode: 'rangeIncrement', value: [1, 23, 11] },
        { field: 'dayOfMonth', mode: 'rangeIncrement', value: [1, 31, 10] },
        { field: 'month', mode: 'rangeIncrement', value: [1, 12, 5] },
        { field: 'dayOfWeek', mode: 'noSpecific', value: '?' },
        { field: 'years', mode: 'rangeIncrement', value: [1970, 2099, 50] },
      ],
    });
  });

  test('supports a range increment in the day-of-week field', () => {
    expect(parse('0 0 12 ? * 1-7/2')).toStrictEqual({
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'rangeIncrement', value: [1, 7, 2] },
      ],
    });
  });

  test('expands an overflowing range increment inside a list', () => {
    expect(parse('0 0 22-2/2,12 ? * *')).toStrictEqual({
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: [22, 0, 2, 12] },
        { field: 'dayOfMonth', mode: 'noSpecific', value: '?' },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'every', value: '*' },
      ],
    });
  });
});

describe('Parser supports Quartz last-day lists', () => {
  test('preserves ordinary days and the last day in one list', () => {
    expect(parse('0 0 12 5,15,L * ?')).toStrictEqual({
      error: null,
      result: [
        { field: 'seconds', mode: 'specific', value: 0 },
        { field: 'minutes', mode: 'specific', value: 0 },
        { field: 'hours', mode: 'specific', value: 12 },
        {
          field: 'dayOfMonth',
          mode: 'list',
          value: [
            { mode: 'specific', value: 5 },
            { mode: 'specific', value: 15 },
            { mode: 'daysBeforeEndOfMonth', value: 0 },
          ],
        },
        { field: 'month', mode: 'every', value: '*' },
        { field: 'dayOfWeek', mode: 'noSpecific', value: '?' },
      ],
    });
  });
});

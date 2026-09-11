import { parse, QuartzCronField, validate } from '../src/index';

const quartzTutorialExpressions = [
  '0/5 14,18,3-39,52 * ? JAN,MAR,SEP MON-FRI 2002-2010',
  '0 0 12 * * ?',
  '0 15 10 ? * *',
  '0 15 10 * * ?',
  '0 15 10 * * ? *',
  '0 15 10 * * ? 2005',
  '0 * 14 * * ?',
  '0 0/5 14 * * ?',
  '0 0/5 14,18 * * ?',
  '0 0-5 14 * * ?',
  '0 10,44 14 ? 3 WED',
  '0 15 10 ? * MON-FRI',
  '0 15 10 15 * ?',
  '0 15 10 L * ?',
  '0 15 10 L-2 * ?',
  '0 15 10 ? * 6L',
  '0 15 10 ? * 6L 2002-2005',
  '0 15 10 ? * 6#3',
  '0 0 12 1/5 * ?',
  '0 11 11 11 11 ?',
];

const quartzRegressionExpressions = [
  '* * * * * ?',
  '0 15 10 L-3 2 ? 2000',
  '0 15 10 L-5W * ? 2010',
  '0 15 10 L-30W * ? 2010',
  '0 15 10 L-1W * ? 2010',
  '0 15 10 1,L * ? 2010',
  '0 15 10 L-1W,L-1 * ? 2010',
  '0 15 10 2W,16 * ? 2010',
  '19 15 10 4 Apr ?',
  '0 43 9 ? * 5L',
  '0 0 0 1W * ?',
  '59 59 23 L * ?',
  '0 0 12 ? * * 1970-1970',
];

const quartzInvalidExpressions = [
  '0 15 10 * * ? 2005 *',
  '* * * * Foo ?',
  '* * * * Jan-Foo ?',
  '0 0 * * * *',
  '0 0 * 4 * *',
  '0 0 * * * 4',
  '0 43 9 ? * SAT,SUN,L',
  '0 43 9 ? * 6,7,L',
  '0/5 * * 32W 1 ?',
  '0 0 0 L-31W * ?',
  '0/60 0 8-18 ? * 2-6',
  '0 0/60 8-18 ? * 2-6',
  '0 0 0/24 ? * 2-6',
  '0 0 0 0/32 * 2-6',
  '0 0 0 ? 0/13 2-6',
  '0 0 0 ? * 0/8',
  '0 0 0 ? * 0/',
  '0 0 0 ? * /',
  'Ralf 30 * * * ?',
  '0 30 Ralf * * ?',
  'kilroy was here',
  'L 30 * * * ?',
];

function parseDayOfMonth(expression: string): QuartzCronField {
  const output = parse(expression);
  expect(output.error).toBeNull();
  if (output.result === null) {
    throw new Error(`Expected expression to parse: ${expression}`);
  }
  return output.result[3];
}

describe('Quartz 2.5.2 tutorial compatibility', () => {
  test.each(quartzTutorialExpressions)('accepts documented expression %p', expression => {
    expect(validate(expression)).toBe(true);
  });
});

describe('Quartz 2.5.2 CronExpression regression compatibility', () => {
  test.each(quartzRegressionExpressions)('accepts upstream regression expression %p', expression => {
    expect(validate(expression)).toBe(true);
  });

  test.each(quartzInvalidExpressions)('rejects upstream invalid expression %p', expression => {
    expect(validate(expression)).toBe(false);
  });

  test('represents L-nW as a weekday relative to the end of the month', () => {
    expect(parseDayOfMonth('0 15 10 L-5W * ? 2010')).toStrictEqual({
      field: 'dayOfMonth',
      mode: 'nearestWeekdayBeforeEndOfMonth',
      value: 5,
    });
  });

  test('preserves L-nW and L-n semantics in the same list', () => {
    expect(parseDayOfMonth('0 15 10 L-1W,L-1 * ? 2010')).toStrictEqual({
      field: 'dayOfMonth',
      mode: 'list',
      value: [
        { mode: 'nearestWeekdayBeforeEndOfMonth', value: 1 },
        { mode: 'daysBeforeEndOfMonth', value: 1 },
      ],
    });
  });

  test('preserves nW and an ordinary day in the same list', () => {
    expect(parseDayOfMonth('0 15 10 2W,16 * ? 2010')).toStrictEqual({
      field: 'dayOfMonth',
      mode: 'list',
      value: [
        { mode: 'nearestWeekdayOfMonth', value: 2 },
        { mode: 'specific', value: 16 },
      ],
    });
  });
});

describe('Quartz year range validation', () => {
  test.each([
    '0 0 12 ? * * 2099-1970',
    '0 0 12 ? * * 2099-1970/10',
    '0 0 12 ? * * 1970,2099-1970',
  ])('rejects a descending year range in %p', expression => {
    expect(validate(expression)).toBe(false);
    expect(() => parse(expression, true)).toThrow('Start year must be less than stop year');
  });
});

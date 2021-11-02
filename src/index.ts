import nearley from 'nearley';
import grammar from './grammar';

export type QuartzCronValidationResult = {
    result: QuartzCronField[];
    error: null;
} | {
    result: null;
    error: Error;
};

export type QuartzCronField = {
  field: 'seconds' | 'minutes' | 'hours' | 'dayOfMonth' | 'month' | 'dayOfWeek' | 'years';
  mode: 'every' | 'noSpecific' | 'specific' | 'increment' | 'range' | 'daysBeforeEndOfMonth' | 'lastweekDay' | 'nearestWeekdayOfMonth' | 'nthWeekDayOfMonth',
  value: number | number[] | '*' | '?';
};

export function parse(cronExpression: string, throwErrorDirectly: boolean = false): QuartzCronValidationResult {
  // Create a Parser object from our grammar.
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar as any));
  try {
    // Parse the cron expression
    const normalizedExpr = `${cronExpression}`.trim().toUpperCase();
    parser.feed(normalizedExpr);
    // Get result
    const result = parser.results[0];

    // Cron expression should have and only have one of day-of-week and a day-of-month field to be "unspecified (?)"
    let dayFieldSpecifiedCount = 0;
    dayFieldSpecifiedCount += ((result[3].mode !== 'noSpecific') ? 1 : 0);
    dayFieldSpecifiedCount += ((result[5].mode !== 'noSpecific') ? 1 : 0);
    if (dayFieldSpecifiedCount === 2) {
      throw new Error(`Support for specifying both a day-of-week and a day-of-month value is not complete (you'll need to use the '?' character in one of these fields).`);
    } else if (dayFieldSpecifiedCount === 0) {
      throw new Error(`'?' can only be specfied for Day-of-Month -OR- Day-of-Week.`);
    }

    // Validate ranges
    if (result != null) {
      validateRanges(result);
    }

    return {
      result,
      error: null,
    };
  } catch (e) {
    if (throwErrorDirectly) {
      throw e;
    }
    // else
    return {
      result: null,
      error: e as Error,
    };
  }
}

export function validate(cronExpression: string): boolean {
  const result = parse(cronExpression);
  return result.error == null;
}

function validateRanges(result: QuartzCronField[]) {
  // seconds
  if (result[0] && result[0].mode === 'range') {
    const value = result[0].value as number[];
    validateRange('Seconds', value[0], value[1], 0, 59);
  }
  // minutes
  if (result[1] && result[1].mode === 'range') {
    const value = result[1].value as number[];
    validateRange('Minutes', value[0], value[1], 0, 59);
  }
  // hours
  if (result[2] && result[2].mode === 'range') {
    const value = result[2].value as number[];
    validateRange('Hours', value[0], value[1], 0, 23);
  }
  // day of month
  if (result[3] && result[3].mode === 'range') {
    const value = result[3].value as number[];
    validateRange('Day of Month', value[0], value[1], 1, 31);
  }
  // months
  if (result[4] && result[4].mode === 'range') {
    const value = result[4].value as number[];
    validateRange('Months', value[0], value[1], 1, 12);
  }
  // day of week
  if (result[5] && result[5].mode === 'range') {
    const value = result[5].value as number[];
    validateRange('Day of Week', value[0], value[1], 1, 7);
  }
  // years
  if (result[6] && result[6].mode === 'range') {
    const value = result[6].value as number[];
    validateRange('Year', value[0], value[1], 1970, 2099);
  }
}

function validateRange(fieldType: string, start: number, end: number, lowerBoundary: number, upperBoundary: number): void {
  if (start > upperBoundary || start < lowerBoundary || end > upperBoundary || end < lowerBoundary) {
    throw new Error(`(${fieldType}) Unsupported value '${start}-${end}' for range. Accepted values are ${lowerBoundary}-${upperBoundary}`);
  }
  if (start > end) {
    throw new Error(`(${fieldType}) Unsupported value '${start}-${end}' for range. Accepted values are ${lowerBoundary}-${upperBoundary}`);
  }
}

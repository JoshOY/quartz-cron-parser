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
      error: e,
    };
  }
}

export function validate(cronExpression: string): boolean {
  const result = parse(cronExpression);
  return result.error == null;
}

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
  mode: 'every' | 'noSpecific' | 'specific' | 'increment' | 'range' | 'daysBeforeEndOfMonth' | 'lastweekDay' | 'nearestWeekdayOfMonth' | 'dayOfWeekBeforeEndOfMonth' | 'nthWeekDayOfMonth',
  value: number | number[] | '*' | '?';
};

type ParsedCronField = QuartzCronField | {
  field: QuartzCronField['field'];
  mode: 'list';
  value: Pick<QuartzCronField, 'mode' | 'value'>[];
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
      result: normalizeLists(result),
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

function validateRanges(result: ParsedCronField[]) {
  const bounds: [string, number, number][] = [
    ['Seconds', 0, 59],
    ['Minutes', 0, 59],
    ['Hours', 0, 23],
    ['Day of Month', 1, 31],
    ['Months', 1, 12],
    ['Day of Week', 1, 7],
    ['Year', 1970, 2099],
  ];
  result.forEach((field, index) => {
    const items = field.mode === 'list' ? field.value : [field];
    items.forEach(item => {
      if (item.mode === 'range') {
        const [start, end] = item.value as number[];
        const [name, lower, upper] = bounds[index];
        validateRange(name, start, end, lower, upper);
      }
    });
  });
}

// Expand only lists; standalone ranges retain their existing public representation.
// Called after validation so invalid or reversed ranges cannot disappear during expansion.
function normalizeLists(result: ParsedCronField[]): QuartzCronField[] {
  return result.map(field => {
    if (field.mode !== 'list') {
      return field;
    }
    const value: number[] = [];
    field.value.forEach(item => {
      if (item.mode === 'range') {
        const [start, end] = item.value as number[];
        for (let current = start; current <= end; current++) {
          value.push(current);
        }
      } else {
        value.push(item.value as number);
      }
    });
    return { field: field.field, mode: 'specific', value };
  });
}

function validateRange(fieldType: string, start: number, end: number, lowerBoundary: number, upperBoundary: number): void {
  if (start > upperBoundary || start < lowerBoundary || end > upperBoundary || end < lowerBoundary) {
    throw new Error(`(${fieldType}) Unsupported value '${start}-${end}' for range. Accepted values are ${lowerBoundary}-${upperBoundary}`);
  }
  if (start > end) {
    throw new Error(`(${fieldType}) Unsupported value '${start}-${end}' for range. Accepted values are ${lowerBoundary}-${upperBoundary}`);
  }
}

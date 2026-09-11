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

import { parse, QuartzCronValidationResult } from '../src/index';
import { parseableCases } from './cases';

describe('Parser should work correctly when cron expression is valid', () => {
  test.each(parseableCases)(`Expression %p should be parsed as expected`, (input: string, expectedResult: QuartzCronValidationResult) => {
    const parserOutput = parse(input);
    expect(parserOutput).toStrictEqual(expectedResult);
  });
});

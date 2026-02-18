import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue';

import { createToolError } from '../errors';
import { err, ok, type Result } from '../result';

export type CronNextRunsOptions = {
  tz?: string;
  count?: number;
};

export function validateCron(expression: string): Result<true, ReturnType<typeof createToolError>> {
  try {
    CronExpressionParser.parse(expression);
    return ok(true);
  } catch (error) {
    return err(createToolError('INVALID_CRON', error instanceof Error ? error.message : 'Invalid cron expression.'));
  }
}

export function describeCron(expression: string): string {
  try {
    return cronstrue.toString(expression, { throwExceptionOnParseError: true, use24HourTimeFormat: true });
  } catch {
    return 'Invalid cron expression';
  }
}

export function nextRuns(
  expression: string,
  options?: CronNextRunsOptions,
): Result<Date[], ReturnType<typeof createToolError>> {
  const count = Math.max(1, Math.min(100, options?.count ?? 10));

  try {
    const interval = CronExpressionParser.parse(expression, {
      tz: options?.tz?.trim() || 'UTC',
    });

    const dates: Date[] = [];

    for (let index = 0; index < count; index += 1) {
      dates.push(interval.next().toDate());
    }

    return ok(dates);
  } catch (error) {
    return err(createToolError('INVALID_CRON', error instanceof Error ? error.message : 'Invalid cron expression.'));
  }
}

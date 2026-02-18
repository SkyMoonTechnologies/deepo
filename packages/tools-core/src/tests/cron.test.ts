import { describe, expect, it } from 'vitest';

import { nextRuns, validateCron } from '../cron';

describe('cron tools', () => {
  it('validates a valid cron expression', () => {
    const result = validateCron('*/5 * * * *');
    expect(result.ok).toBe(true);
  });

  it('returns the expected number of next runs', () => {
    const result = nextRuns('0 * * * *', { tz: 'UTC', count: 10 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(10);
    }
  });

  it('returns an invalid cron error', () => {
    const result = validateCron('bad cron');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_CRON');
    }
  });
});

import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { formatTimestampOutputs, parseTimestamp } from '../time';

describe('time tools', () => {
  it('parses unix seconds', () => {
    const parsed = parseTimestamp('1700000000');

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.mode).toBe('unix-seconds');
    }
  });

  it('parses unix milliseconds', () => {
    const parsed = parseTimestamp('1700000000000');

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.mode).toBe('unix-milliseconds');
    }
  });

  it('parses iso strings and formats output modes', () => {
    const parsed = parseTimestamp('2024-03-01T10:00:00Z');

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    const formatted = formatTimestampOutputs(parsed.value.dateTime, {
      timezone: 'UTC',
      customFormat: 'yyyy LLL dd HH:mm',
      now: DateTime.fromISO('2024-03-01T12:00:00Z'),
    });

    expect(formatted.iso).toContain('2024-03-01T10:00:00.000Z');
    expect(/GMT|\+0000/.test(formatted.rfc2822)).toBe(true);
    expect(formatted.relative).toContain('2');
    expect(formatted.custom).toBe('2024 Mar 01 10:00');
  });
});

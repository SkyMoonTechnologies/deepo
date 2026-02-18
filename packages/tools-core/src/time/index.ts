import { DateTime } from 'luxon';

import { createToolError } from '../errors';
import { err, ok, type Result } from '../result';

export type ParsedTimestampMode = 'unix-seconds' | 'unix-milliseconds' | 'iso';

export type ParsedTimestamp = {
  mode: ParsedTimestampMode;
  dateTime: DateTime;
};

export type TimestampFormats = {
  iso: string;
  rfc2822: string;
  relative: string;
  custom: string;
};

const INTEGER_PATTERN = /^-?\d+$/;

function parseFromNumber(input: string): ParsedTimestamp | null {
  if (!INTEGER_PATTERN.test(input)) {
    return null;
  }

  const asNumber = Number(input);
  if (!Number.isFinite(asNumber)) {
    return null;
  }

  if (Math.abs(asNumber) >= 1e12) {
    const dateTime = DateTime.fromMillis(asNumber);
    return dateTime.isValid ? { mode: 'unix-milliseconds', dateTime } : null;
  }

  const dateTime = DateTime.fromSeconds(asNumber);
  return dateTime.isValid ? { mode: 'unix-seconds', dateTime } : null;
}

function parseFromIsoLike(input: string): ParsedTimestamp | null {
  const fromIso = DateTime.fromISO(input, { setZone: true });
  if (fromIso.isValid) {
    return { mode: 'iso', dateTime: fromIso };
  }

  const fromRfc = DateTime.fromRFC2822(input, { setZone: true });
  if (fromRfc.isValid) {
    return { mode: 'iso', dateTime: fromRfc };
  }

  const fromHttp = DateTime.fromHTTP(input, { setZone: true });
  if (fromHttp.isValid) {
    return { mode: 'iso', dateTime: fromHttp };
  }

  return null;
}

export function parseTimestamp(input: string): Result<ParsedTimestamp, ReturnType<typeof createToolError>> {
  const normalized = input.trim();

  if (normalized.length === 0) {
    return err(createToolError('INVALID_TIMESTAMP', 'Timestamp input cannot be empty.'));
  }

  const numeric = parseFromNumber(normalized);
  if (numeric) {
    return ok(numeric);
  }

  const isoLike = parseFromIsoLike(normalized);
  if (isoLike) {
    return ok(isoLike);
  }

  return err(createToolError('INVALID_TIMESTAMP', 'Unsupported timestamp input. Use unix seconds, unix ms, or ISO.'));
}

export function formatTimestampOutputs(
  dateTime: DateTime,
  options?: {
    timezone?: string;
    customFormat?: string;
    now?: DateTime;
  },
): TimestampFormats {
  const timezone = options?.timezone?.trim() || 'UTC';
  const zoned = dateTime.setZone(timezone);
  const now = (options?.now ?? DateTime.now()).setZone(timezone);
  const customFormat = options?.customFormat?.trim() || 'yyyy-LL-dd HH:mm:ss ZZZZ';
  const rfc2822 = zoned.toRFC2822() ?? '';

  return {
    iso: zoned.toISO() ?? '',
    rfc2822: timezone === 'UTC' ? rfc2822.replace(/\+0000$/, 'GMT') : rfc2822,
    relative: zoned.toRelative({ base: now }) ?? '',
    custom: zoned.toFormat(customFormat),
  };
}

export function listCommonTimezones(): string[] {
  return [
    'UTC',
    'America/Los_Angeles',
    'America/Denver',
    'America/Chicago',
    'America/New_York',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Kolkata',
    'Australia/Sydney',
  ];
}

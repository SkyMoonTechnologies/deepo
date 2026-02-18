import { describe, expect, it } from 'vitest';

import { err, isErr, isOk, ok, type Result } from '../result';

type TestError = {
  code: string;
  message: string;
};

describe('result helpers', () => {
  it('creates ok results', () => {
    const result = ok(42);

    expect(result).toEqual({ ok: true, value: 42 });
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
  });

  it('creates err results', () => {
    const result = err<TestError>({
      code: 'BAD_INPUT',
      message: 'Input was invalid',
    });

    expect(result).toEqual({
      ok: false,
      error: { code: 'BAD_INPUT', message: 'Input was invalid' },
    });
    expect(isOk(result)).toBe(false);
    expect(isErr(result)).toBe(true);
  });

  it('narrowing works for branches', () => {
    const result: Result<number, TestError> =
      Math.random() > 0.5
        ? ok(7)
        : err({ code: 'BAD_INPUT', message: 'Input was invalid' });

    if (isOk(result)) {
      expect(result.value).toBe(7);
      return;
    }

    expect(result.error.code).toBe('BAD_INPUT');
  });
});

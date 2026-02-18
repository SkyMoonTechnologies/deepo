import { describe, expect, it } from 'vitest';

import { diffText } from '../diff';

describe('text diff', () => {
  it('ignores whitespace when requested', () => {
    const result = diffText('hello   world\n', 'hello world\n', { ignoreWhitespace: true });

    expect(result.rows.every((row) => row.kind === 'equal')).toBe(true);
  });

  it('produces word-level highlight data for changed rows', () => {
    const result = diffText('hello world', 'hello brave world', { wordDiff: true });
    const changed = result.rows.find((row) => row.kind === 'changed');

    expect(changed).toBeDefined();
    expect(changed?.rightWords?.some((part) => part.kind === 'added')).toBe(true);
  });
});

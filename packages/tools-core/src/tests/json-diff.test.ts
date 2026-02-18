import { describe, expect, it } from 'vitest';

import { diffJsonSemantic, parseJsonPair } from '../json-diff';

describe('json semantic diff', () => {
  it('tracks added removed and changed paths', () => {
    const { left, right } = parseJsonPair('{"a":1,"b":2}', '{"a":3,"c":2}');
    const result = diffJsonSemantic(left, right);

    expect(result.changed).toEqual([{ path: '$.a', before: 1, after: 3 }]);
    expect(result.removed).toEqual(['$.b']);
    expect(result.added).toEqual(['$.c']);
  });

  it('supports order-insensitive primitive arrays', () => {
    const { left, right } = parseJsonPair('{"tags":["a","b"]}', '{"tags":["b","a"]}');
    const strict = diffJsonSemantic(left, right, { arraysOrderInsensitive: false });
    const insensitive = diffJsonSemantic(left, right, { arraysOrderInsensitive: true });

    expect(strict.changed.length).toBeGreaterThan(0);
    expect(insensitive.changed).toHaveLength(0);
  });
});

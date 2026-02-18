import { describe, expect, it } from 'vitest';

import { formatJson, parseJson, stableSortKeysDeep, validateJson } from '../json';

describe('json tools', () => {
  it('parses valid JSON', () => {
    const result = parseJson('{"name":"deepo","ok":true}');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ name: 'deepo', ok: true });
    }
  });

  it('fails invalid JSON with line and column best effort', () => {
    const validation = validateJson('{\n  "name": "deepo",\n  }');

    expect(validation.ok).toBe(false);
    expect(validation.errors).toHaveLength(1);
    expect(validation.errors[0].line).toBeGreaterThanOrEqual(1);
    expect(validation.errors[0].column).toBeGreaterThanOrEqual(1);
    expect(validation.errors[0].message.length).toBeGreaterThan(0);
  });

  it('formats deterministically', () => {
    const input = {
      zebra: 1,
      alpha: {
        delta: true,
        beta: false,
      },
    };

    const formatted = formatJson(input, { indent: 2, sortKeys: true });

    expect(formatted).toBe(
      '{\n  "alpha": {\n    "beta": false,\n    "delta": true\n  },\n  "zebra": 1\n}',
    );
  });

  it('sort keys deep preserves arrays order', () => {
    const value = {
      z: [
        { b: 2, a: 1 },
        { d: 4, c: 3 },
      ],
      a: 'x',
    };

    const sorted = stableSortKeysDeep(value);

    expect(sorted).toEqual({
      a: 'x',
      z: [
        { a: 1, b: 2 },
        { c: 3, d: 4 },
      ],
    });
    expect((sorted as { z: unknown[] }).z[0]).toEqual({ a: 1, b: 2 });
    expect((sorted as { z: unknown[] }).z[1]).toEqual({ c: 3, d: 4 });
  });
});

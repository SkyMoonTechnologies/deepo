import { describe, expect, it } from 'vitest';

import { generateUlid, generateUuidV4, validateUlid, validateUuid } from '../ids';

describe('ids tools', () => {
  it('validates uuid values', () => {
    const value = generateUuidV4(1)[0];

    expect(validateUuid(value)).toBe(true);
    expect(validateUuid('not-a-uuid')).toBe(false);
  });

  it('validates ulid values', () => {
    const value = generateUlid(1)[0];

    expect(validateUlid(value)).toBe(true);
    expect(validateUlid('bad-ulid')).toBe(false);
  });
});

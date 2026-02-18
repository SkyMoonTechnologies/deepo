import { describe, expect, it } from 'vitest';

import { generateClamp, generateTypeScale } from '../typography';

describe('typography scale', () => {
  it('builds scale values from ratio', () => {
    const values = generateTypeScale(16, 1.25, 3);

    expect(values).toEqual([16, 20, 25, 31.25]);
  });

  it('generates CSS clamp', () => {
    const clamp = generateClamp({ minSizePx: 16, maxSizePx: 24, minViewportPx: 320, maxViewportPx: 1280 });

    expect(clamp.startsWith('clamp(')).toBe(true);
    expect(clamp.includes('vw')).toBe(true);
  });
});

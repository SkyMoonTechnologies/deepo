import { describe, expect, it } from 'vitest';

import { computeContainDimensions } from '../image';

describe('image helpers', () => {
  it('keeps aspect ratio while resizing', () => {
    const resized = computeContainDimensions(2000, 1000, 1000, 1000);

    expect(resized).toEqual({ width: 1000, height: 500 });
  });
});

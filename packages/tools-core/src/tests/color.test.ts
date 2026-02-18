import { describe, expect, it } from 'vitest';

import { buildHarmonyPalette, convertColor } from '../color';

describe('color converter and palette', () => {
  it('converts to all target formats', () => {
    const converted = convertColor('#3366ff');

    expect(converted).not.toBeNull();
    expect(converted?.hex).toBe('#3366ff');
    expect(converted?.rgb.startsWith('rgb(')).toBe(true);
    expect(converted?.hsl.startsWith('hsl(')).toBe(true);
    expect(converted?.oklch.startsWith('oklch(')).toBe(true);
  });

  it('builds harmony palettes', () => {
    const palette = buildHarmonyPalette('#3366ff', 'triad');

    expect(palette.length).toBeGreaterThanOrEqual(3);
  });
});

import { describe, expect, it } from 'vitest';

import { evaluateContrast, suggestNearestCompliantColors } from '../color/contrast';

describe('contrast checker', () => {
  it('computes WCAG badges', () => {
    const report = evaluateContrast('#000000', '#ffffff');

    expect(report).not.toBeNull();
    expect(report?.wcag.normalAAA).toBe(true);
  });

  it('suggests compliant colors when needed', () => {
    const suggestions = suggestNearestCompliantColors('#777777', '#ffffff');

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].ratio).toBeGreaterThanOrEqual(4.5);
  });
});

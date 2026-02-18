import { describe, expect, it } from 'vitest';

import { applyReplace, compileRegex, findMatches, isRiskyRegex } from '../regex';

describe('regex tools', () => {
  it('captures groups', () => {
    const compiled = compileRegex('(\\w+)-(\\d+)', 'g');

    expect(compiled.ok).toBe(true);
    if (!compiled.ok) {
      return;
    }

    const matches = findMatches(compiled.value, 'task-01 item-22');

    expect(matches).toHaveLength(2);
    expect(matches[0].groups).toEqual(['task', '01']);
    expect(matches[1].groups).toEqual(['item', '22']);
  });

  it('applies replace preview', () => {
    const compiled = compileRegex('(cat)', 'g');

    expect(compiled.ok).toBe(true);
    if (!compiled.ok) {
      return;
    }

    const replaced = applyReplace(compiled.value, 'cat catalog', 'dog');

    expect(replaced.ok).toBe(true);
    if (replaced.ok) {
      expect(replaced.value).toBe('dog dogalog');
    }
  });

  it('warns on risky regex patterns', () => {
    expect(isRiskyRegex('(a+)+$')).toBe(true);
    expect(isRiskyRegex('^a+$')).toBe(false);
  });
});

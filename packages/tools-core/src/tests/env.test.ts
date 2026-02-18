import { describe, expect, it } from 'vitest';

import { exportEnv, parseEnv } from '../env';

describe('env tools', () => {
  it('parses env entries and finds duplicates/issues', () => {
    const parsed = parseEnv('API_KEY=abc\nEMPTY=\nBAD-KEY=x\nAPI_KEY=xyz');

    expect(parsed.entries).toHaveLength(4);
    expect(parsed.duplicates).toEqual(['API_KEY']);
    expect(parsed.issues.some((issue) => issue.type === 'empty-value')).toBe(true);
    expect(parsed.issues.some((issue) => issue.type === 'invalid-key')).toBe(true);
  });

  it('exports dotenv/json/shell formats', () => {
    const parsed = parseEnv('A=1\nB=two');

    expect(exportEnv(parsed.entries, 'dotenv')).toBe('A=1\nB=two');
    expect(exportEnv(parsed.entries, 'json')).toContain('"A": "1"');
    expect(exportEnv(parsed.entries, 'shell')).toContain("export A='1'");
  });
});

import { describe, expect, it } from 'vitest';

import { buildUtmVariants, validateBaseUrl, validateUtmParams } from '../utm';

describe('utm builder', () => {
  it('validates base URL and params', () => {
    expect(validateBaseUrl('https://example.com')).toEqual({ ok: true });
    expect(validateUtmParams({ source: 'google', medium: 'cpc', campaign: 'launch' })).toEqual({ ok: true });
  });

  it('builds full and short variants', () => {
    const variants = buildUtmVariants('https://example.com', {
      source: 'google',
      medium: 'cpc',
      campaign: 'spring',
      term: 'shoes',
      content: 'ad-a',
    });

    expect(variants.full).toContain('utm_term=shoes');
    expect(variants.short).not.toContain('utm_term=shoes');
  });
});

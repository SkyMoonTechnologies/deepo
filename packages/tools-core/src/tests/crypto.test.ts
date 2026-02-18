import { describe, expect, it } from 'vitest';

import { constantTimeCompareHex, hmacSha256, sha256, sha512 } from '../crypto';

describe('crypto tools', () => {
  it('computes SHA-256 with known vector', async () => {
    const digest = await sha256('abc');

    expect(digest).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('computes SHA-512 with known vector', async () => {
    const digest = await sha512('abc');

    expect(digest).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a'
        + '2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    );
  });

  it('computes HMAC-SHA256 with known vector', async () => {
    const digest = await hmacSha256('The quick brown fox jumps over the lazy dog', 'key');

    expect(digest).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
  });

  it('compares hex in constant-time style', () => {
    expect(constantTimeCompareHex('0a0b0c', '0a0b0c')).toBe(true);
    expect(constantTimeCompareHex('0a0b0c', '0a0b0d')).toBe(false);
    expect(constantTimeCompareHex('0a0b0c', '0a0b0c00')).toBe(false);
  });

  it('returns false for invalid hex values', () => {
    expect(constantTimeCompareHex('xyz', '00')).toBe(false);
    expect(constantTimeCompareHex('0', '00')).toBe(false);
  });
});

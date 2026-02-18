import { SignJWT } from 'jose';
import { describe, expect, it } from 'vitest';

import { decodeJwt, verifyJwt } from '../jwt';

describe('jwt tools', () => {
  it('decodeJwt returns header, payload, and signature', async () => {
    const secret = new globalThis.TextEncoder().encode('unit-test-secret');
    const token = await new SignJWT({ sub: 'user-123', role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(secret);

    const decoded = decodeJwt(token);

    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.value.header.alg).toBe('HS256');
      expect(decoded.value.payload.sub).toBe('user-123');
      expect(decoded.value.signature.length).toBeGreaterThan(0);
    }
  });

  it('verifyJwt fails when HS key is missing', async () => {
    const secret = new globalThis.TextEncoder().encode('unit-test-secret');
    const token = await new SignJWT({ sub: 'user-123' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(secret);

    const result = await verifyJwt(token, {});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('JWT_MISSING_HS_SECRET');
    }
  });

  it('verifyJwt succeeds for HS256 token with correct secret', async () => {
    const secretString = 'unit-test-secret';
    const secret = new globalThis.TextEncoder().encode(secretString);
    const token = await new SignJWT({ sub: 'user-123', example: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(secret);

    const result = await verifyJwt(token, { secret: secretString });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.valid).toBe(true);
      expect(result.value.alg).toBe('HS256');
      expect(result.value.payload.sub).toBe('user-123');
    }
  });
});

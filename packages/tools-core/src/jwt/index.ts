import {
  decodeJwt as joseDecodeJwt,
  decodeProtectedHeader,
  importSPKI,
  jwtVerify,
} from 'jose';

import { createToolError, type ToolError } from '../errors';
import { err, ok, type Result } from '../result';

export type JwtObject = Record<string, unknown>;

export type DecodedJwt = {
  header: JwtObject;
  payload: JwtObject;
  signature: string;
};

export type VerifyJwtResult = {
  valid: boolean;
  alg: string;
  payload: JwtObject;
};

export type VerifyJwtOptions = {
  secret?: string;
  publicKeyPem?: string;
};

function normalizeToken(token: string): string {
  return token.trim();
}

function getTokenParts(token: string): string[] | null {
  const parts = token.split('.');
  return parts.length === 3 ? parts : null;
}

function decodeHeader(token: string): Result<JwtObject, ToolError> {
  try {
    return ok(decodeProtectedHeader(token) as JwtObject);
  } catch (error) {
    return err(createToolError('JWT_INVALID_HEADER', 'Unable to decode JWT header.', error));
  }
}

function decodePayload(token: string): Result<JwtObject, ToolError> {
  try {
    return ok(joseDecodeJwt(token) as JwtObject);
  } catch (error) {
    return err(createToolError('JWT_INVALID_PAYLOAD', 'Unable to decode JWT payload.', error));
  }
}

export function decodeJwt(token: string): Result<DecodedJwt, ToolError> {
  const normalizedToken = normalizeToken(token);
  const parts = getTokenParts(normalizedToken);

  if (!parts) {
    return err(
      createToolError(
        'JWT_INVALID_FORMAT',
        'JWT must contain exactly three dot-separated parts.',
      ),
    );
  }

  const headerResult = decodeHeader(normalizedToken);
  if (!headerResult.ok) {
    return headerResult;
  }

  const payloadResult = decodePayload(normalizedToken);
  if (!payloadResult.ok) {
    return payloadResult;
  }

  return ok({
    header: headerResult.value,
    payload: payloadResult.value,
    signature: parts[2],
  });
}

export async function verifyJwt(
  token: string,
  opts: VerifyJwtOptions,
): Promise<Result<VerifyJwtResult, ToolError>> {
  const normalizedToken = normalizeToken(token);
  const decodedResult = decodeJwt(normalizedToken);

  if (!decodedResult.ok) {
    return decodedResult;
  }

  const headerAlg = decodedResult.value.header.alg;
  if (typeof headerAlg !== 'string' || headerAlg.length === 0) {
    return err(createToolError('JWT_MISSING_ALG', 'JWT header is missing algorithm (alg).'));
  }

  try {
    if (headerAlg.startsWith('HS')) {
      const secret = opts.secret?.trim();
      if (!secret) {
        return err(
          createToolError(
            'JWT_MISSING_HS_SECRET',
            `Secret is required to verify ${headerAlg} tokens.`,
          ),
        );
      }

      const secretBytes = new globalThis.TextEncoder().encode(secret);
      const verification = await jwtVerify(normalizedToken, secretBytes, {
        algorithms: [headerAlg],
      });

      return ok({
        valid: true,
        alg: verification.protectedHeader.alg ?? headerAlg,
        payload: verification.payload as JwtObject,
      });
    }

    if (headerAlg.startsWith('RS')) {
      const publicKeyPem = opts.publicKeyPem?.trim();
      if (!publicKeyPem) {
        return err(
          createToolError(
            'JWT_MISSING_RS_PUBLIC_KEY',
            `Public key PEM is required to verify ${headerAlg} tokens.`,
          ),
        );
      }

      const publicKey = await importSPKI(publicKeyPem, headerAlg);
      const verification = await jwtVerify(normalizedToken, publicKey, {
        algorithms: [headerAlg],
      });

      return ok({
        valid: true,
        alg: verification.protectedHeader.alg ?? headerAlg,
        payload: verification.payload as JwtObject,
      });
    }

    return err(
      createToolError(
        'JWT_UNSUPPORTED_ALG',
        `Unsupported JWT algorithm "${headerAlg}". Only HS* and RS* are supported.`,
      ),
    );
  } catch (error) {
    return err(createToolError('JWT_VERIFY_FAILED', 'JWT signature verification failed.', error));
  }
}

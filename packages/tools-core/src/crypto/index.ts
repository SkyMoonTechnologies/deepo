function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function normalizeHex(input: string): string {
  return input.replace(/\s+/g, '').toLowerCase();
}

function hexToBytes(input: string): Uint8Array | null {
  const normalized = normalizeHex(input);

  if (normalized.length % 2 !== 0) {
    return null;
  }

  if (normalized.length === 0) {
    return new Uint8Array();
  }

  if (!/^[0-9a-f]+$/.test(normalized)) {
    return null;
  }

  const bytes = new Uint8Array(normalized.length / 2);

  for (let index = 0; index < normalized.length; index += 2) {
    bytes[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16);
  }

  return bytes;
}

async function digestText(algorithm: 'SHA-256' | 'SHA-512', text: string): Promise<string> {
  const payload = new globalThis.TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest(algorithm, payload);
  return bytesToHex(new Uint8Array(digest));
}

export async function sha256(text: string): Promise<string> {
  return digestText('SHA-256', text);
}

export async function sha512(text: string): Promise<string> {
  return digestText('SHA-512', text);
}

export async function hmacSha256(text: string, secret: string): Promise<string> {
  const secretBytes = new globalThis.TextEncoder().encode(secret);
  const payload = new globalThis.TextEncoder().encode(text);
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    secretBytes,
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );

  const signature = await globalThis.crypto.subtle.sign('HMAC', key, payload);
  return bytesToHex(new Uint8Array(signature));
}

export function constantTimeCompareHex(a: string, b: string): boolean {
  const left = hexToBytes(a);
  const right = hexToBytes(b);

  if (!left || !right) {
    return false;
  }

  const maxLength = Math.max(left.length, right.length);
  let mismatch = left.length === right.length ? 0 : 1;

  for (let index = 0; index < maxLength; index += 1) {
    const leftByte = index < left.length ? left[index] : 0;
    const rightByte = index < right.length ? right[index] : 0;
    mismatch |= leftByte ^ rightByte;
  }

  return mismatch === 0;
}

import { parseError, type ToolError } from '../errors';
import { ok, type Result } from '../result';

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const HTML_DECODE_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

const HTML_ENCODE_PATTERN = /[&<>"']/g;
const HTML_DECODE_PATTERN = /&(amp|lt|gt|quot|apos|#39);/g;

function bytesToBinaryString(bytes: Uint8Array): string {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }

  return binary;
}

function binaryStringToBytes(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length);

  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.codePointAt(index) ?? 0;
  }

  return bytes;
}

function normalizeBase64Input(input: string): string {
  const compact = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');

  if (compact.length === 0) {
    return compact;
  }

  const paddingRemainder = compact.length % 4;

  if (paddingRemainder === 0) {
    return compact;
  }

  return compact.padEnd(compact.length + (4 - paddingRemainder), '=');
}

export function base64Encode(input: string): string {
  const bytes = new globalThis.TextEncoder().encode(input);
  return globalThis.btoa(bytesToBinaryString(bytes));
}

export function base64Decode(input: string): Result<string, ToolError> {
  const normalized = normalizeBase64Input(input);

  if (normalized.length === 0) {
    return ok('');
  }

  try {
    const binary = globalThis.atob(normalized);
    const bytes = binaryStringToBytes(binary);
    const decoded = new globalThis.TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return ok(decoded);
  } catch {
    return parseError('Invalid Base64 input.');
  }
}

export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

export function urlDecode(input: string): Result<string, ToolError> {
  try {
    const normalized = input.replace(/\+/g, '%20');
    return ok(decodeURIComponent(normalized));
  } catch {
    return parseError('Invalid URL-encoded input.');
  }
}

export function htmlEncode(input: string): string {
  return input.replace(HTML_ENCODE_PATTERN, (match) => HTML_ENTITY_MAP[match] ?? match);
}

export function htmlDecode(input: string): Result<string, ToolError> {
  return ok(input.replace(HTML_DECODE_PATTERN, (match) => HTML_DECODE_MAP[match] ?? match));
}

export type EncoderMode = 'base64' | 'url' | 'html';
export type EncoderDirection = 'encode' | 'decode';

export function transformText(
  mode: EncoderMode,
  direction: EncoderDirection,
  input: string,
): Result<string, ToolError> {
  if (direction === 'encode') {
    if (mode === 'base64') {
      return ok(base64Encode(input));
    }

    if (mode === 'url') {
      return ok(urlEncode(input));
    }

    return ok(htmlEncode(input));
  }

  if (mode === 'base64') {
    return base64Decode(input);
  }

  if (mode === 'url') {
    return urlDecode(input);
  }

  return htmlDecode(input);
}

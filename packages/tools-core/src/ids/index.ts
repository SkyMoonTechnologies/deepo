import { ulid, isValid as isValidUlid } from 'ulid';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

function normalizeCount(count: number): number {
  if (!Number.isFinite(count)) {
    return 1;
  }

  return Math.max(1, Math.min(500, Math.floor(count)));
}

export function generateUuidV4(count: number): string[] {
  return Array.from({ length: normalizeCount(count) }, () => uuidv4());
}

export function validateUuid(value: string): boolean {
  return uuidValidate(value.trim());
}

export function generateUlid(count: number): string[] {
  return Array.from({ length: normalizeCount(count) }, () => ulid());
}

export function validateUlid(value: string): boolean {
  return isValidUlid(value.trim());
}

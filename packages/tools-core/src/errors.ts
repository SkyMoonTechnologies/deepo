import { err, type Result } from './result';

export type ToolError = {
  code: string;
  message: string;
  details?: unknown;
};

export function createToolError(
  code: string,
  message: string,
  details?: unknown,
): ToolError {
  return { code, message, details };
}

export function parseError(
  message: string,
  details?: unknown,
): Result<never, ToolError> {
  return err(createToolError('PARSE_ERROR', message, details));
}

export function validationError(
  message: string,
  details?: unknown,
): Result<never, ToolError> {
  return err(createToolError('VALIDATION_ERROR', message, details));
}

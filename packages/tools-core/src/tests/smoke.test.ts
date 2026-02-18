import { describe, expect, it } from 'vitest';

import {
  createToolError,
  parseError,
  validationError,
  type Result,
  type ToolError,
} from '../index';

describe('tools-core smoke', () => {
  it('exports ToolError helpers', () => {
    const error = createToolError('X_CODE', 'Something happened', {
      source: 'unit-test',
    });

    expect(error).toEqual({
      code: 'X_CODE',
      message: 'Something happened',
      details: { source: 'unit-test' },
    });
  });

  it('parse and validation helpers return Err results', () => {
    const parseResult: Result<never, ToolError> = parseError('Bad JSON', {
      input: '{',
    });
    const validationResult: Result<never, ToolError> = validationError(
      'Missing required field',
      { field: 'name' },
    );

    expect(parseResult).toEqual({
      ok: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Bad JSON',
        details: { input: '{' },
      },
    });
    expect(validationResult).toEqual({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Missing required field',
        details: { field: 'name' },
      },
    });
  });
});

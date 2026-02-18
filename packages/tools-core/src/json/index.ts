import { err, ok, type Result } from '../result';

export type JsonValidationError = {
  message: string;
  line: number;
  column: number;
};

export type FormatJsonOptions = {
  indent: 2 | 4;
  sortKeys: boolean;
};

const JSON_POSITION_PATTERN = /position\s+(\d+)/i;
const JSON_LINE_COLUMN_PATTERN = /line\s+(\d+)\s+column\s+(\d+)/i;

function offsetToLineColumn(input: string, offset: number): { line: number; column: number } {
  if (offset <= 0) {
    return { line: 1, column: 1 };
  }

  let line = 1;
  let column = 1;
  const limit = Math.min(offset, input.length);

  for (let index = 0; index < limit; index += 1) {
    if (input[index] === '\n') {
      line += 1;
      column = 1;
      continue;
    }

    column += 1;
  }

  return { line, column };
}

function parseJsonError(error: unknown, input: string): JsonValidationError {
  const fallbackMessage = 'Invalid JSON input.';

  if (!(error instanceof Error)) {
    return {
      message: fallbackMessage,
      line: 1,
      column: 1,
    };
  }

  const lineColumnMatch = JSON_LINE_COLUMN_PATTERN.exec(error.message);
  if (lineColumnMatch) {
    return {
      message: error.message,
      line: Number(lineColumnMatch[1]) || 1,
      column: Number(lineColumnMatch[2]) || 1,
    };
  }

  const positionMatch = JSON_POSITION_PATTERN.exec(error.message);
  if (positionMatch) {
    const position = Number(positionMatch[1]);
    const { line, column } = offsetToLineColumn(input, Number.isFinite(position) ? position : 0);

    return {
      message: error.message,
      line,
      column,
    };
  }

  return {
    message: error.message,
    line: 1,
    column: 1,
  };
}

export function stableSortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => stableSortKeysDeep(entry));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const sortedEntries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  const sortedObject: Record<string, unknown> = {};

  for (const [key, entryValue] of sortedEntries) {
    sortedObject[key] = stableSortKeysDeep(entryValue);
  }

  return sortedObject;
}

export function parseJson(input: string): Result<unknown, JsonValidationError> {
  try {
    return ok(JSON.parse(input));
  } catch (error) {
    return err(parseJsonError(error, input));
  }
}

export function formatJson(value: unknown, opts: FormatJsonOptions): string {
  const preparedValue = opts.sortKeys ? stableSortKeysDeep(value) : value;
  return JSON.stringify(preparedValue, null, opts.indent);
}

export function validateJson(input: string): {
  ok: boolean;
  errors: JsonValidationError[];
} {
  const parsed = parseJson(input);

  if (parsed.ok) {
    return {
      ok: true,
      errors: [],
    };
  }

  return {
    ok: false,
    errors: [parsed.error],
  };
}

export type JsonDiffOptions = {
  arraysOrderInsensitive?: boolean;
};

export type JsonDiffChanged = {
  path: string;
  before: unknown;
  after: unknown;
};

export type JsonDiffResult = {
  added: string[];
  removed: string[];
  changed: JsonDiffChanged[];
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPrimitive = (value: unknown): value is string | number | boolean | null =>
  value === null || ['string', 'number', 'boolean'].includes(typeof value);

const appendPath = (path: string, key: string | number): string => {
  if (typeof key === 'number') {
    return `${path}[${key}]`;
  }

  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
    return `${path}.${key}`;
  }

  return `${path}[${JSON.stringify(key)}]`;
};

const arraysEqualAsPrimitiveMultiset = (left: unknown[], right: unknown[]): boolean => {
  if (!left.every(isPrimitive) || !right.every(isPrimitive)) {
    return false;
  }

  const count = new Map<string, number>();

  for (const value of left) {
    const key = JSON.stringify(value);
    count.set(key, (count.get(key) ?? 0) + 1);
  }

  for (const value of right) {
    const key = JSON.stringify(value);
    const existing = count.get(key) ?? 0;

    if (existing === 0) {
      return false;
    }

    count.set(key, existing - 1);
  }

  return [...count.values()].every((value) => value === 0);
};

const diffRecursive = (
  left: unknown,
  right: unknown,
  path: string,
  options: JsonDiffOptions,
  output: JsonDiffResult,
) => {
  if (Array.isArray(left) && Array.isArray(right)) {
    if (options.arraysOrderInsensitive && arraysEqualAsPrimitiveMultiset(left, right)) {
      return;
    }

    const maxLength = Math.max(left.length, right.length);
    for (let index = 0; index < maxLength; index += 1) {
      const nextPath = appendPath(path, index);

      if (index >= left.length) {
        output.added.push(nextPath);
        continue;
      }

      if (index >= right.length) {
        output.removed.push(nextPath);
        continue;
      }

      diffRecursive(left[index], right[index], nextPath, options, output);
    }
    return;
  }

  if (isObject(left) && isObject(right)) {
    const leftKeys = new Set(Object.keys(left));
    const rightKeys = new Set(Object.keys(right));

    for (const key of leftKeys) {
      const nextPath = appendPath(path, key);
      if (!rightKeys.has(key)) {
        output.removed.push(nextPath);
        continue;
      }

      diffRecursive(left[key], right[key], nextPath, options, output);
    }

    for (const key of rightKeys) {
      if (!leftKeys.has(key)) {
        output.added.push(appendPath(path, key));
      }
    }

    return;
  }

  if (Object.is(left, right)) {
    return;
  }

  output.changed.push({ path, before: left, after: right });
};

export function parseJsonPair(leftText: string, rightText: string): { left: unknown; right: unknown } {
  return {
    left: JSON.parse(leftText),
    right: JSON.parse(rightText),
  };
}

export function diffJsonSemantic(left: unknown, right: unknown, options: JsonDiffOptions = {}): JsonDiffResult {
  const result: JsonDiffResult = {
    added: [],
    removed: [],
    changed: [],
  };

  diffRecursive(left, right, '$', options, result);

  result.added.sort();
  result.removed.sort();
  result.changed.sort((a, b) => a.path.localeCompare(b.path));

  return result;
}

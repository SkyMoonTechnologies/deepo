import safeRegex from 'safe-regex2';

import { createToolError } from '../errors';
import { err, ok, type Result } from '../result';

export type RegexMatch = {
  index: number;
  match: string;
  groups: string[];
  namedGroups: Record<string, string>;
};

function withGlobalFlag(regex: RegExp): RegExp {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  return new RegExp(regex.source, flags);
}

export function compileRegex(pattern: string, flags: string): Result<RegExp, ReturnType<typeof createToolError>> {
  try {
    return ok(new RegExp(pattern, flags));
  } catch (error) {
    return err(
      createToolError('INVALID_REGEX', error instanceof Error ? error.message : 'Invalid regex pattern or flags.'),
    );
  }
}

export function findMatches(regex: RegExp, text: string): RegexMatch[] {
  const globalRegex = withGlobalFlag(regex);
  const matches: RegexMatch[] = [];

  let next = globalRegex.exec(text);

  while (next) {
    const groups = next.slice(1).map((value) => value ?? '');
    const namedGroups = Object.fromEntries(Object.entries(next.groups ?? {}).map(([key, value]) => [key, value ?? '']));

    matches.push({
      index: next.index,
      match: next[0] ?? '',
      groups,
      namedGroups,
    });

    if ((next[0] ?? '').length === 0) {
      globalRegex.lastIndex += 1;
    }

    next = globalRegex.exec(text);
  }

  return matches;
}

export function applyReplace(
  regex: RegExp,
  text: string,
  replacement: string,
): Result<string, ReturnType<typeof createToolError>> {
  try {
    return ok(text.replace(regex, replacement));
  } catch (error) {
    return err(createToolError('REPLACE_ERROR', error instanceof Error ? error.message : 'Replace failed.'));
  }
}

export function isRiskyRegex(pattern: string): boolean {
  try {
    return !safeRegex(pattern);
  } catch {
    return true;
  }
}

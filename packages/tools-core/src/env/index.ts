export type EnvEntry = {
  key: string;
  value: string;
  line: number;
};

export type EnvIssueType = 'duplicate-key' | 'empty-value' | 'invalid-key';

export type EnvIssue = {
  type: EnvIssueType;
  key: string;
  line: number;
  message: string;
};

export type ParsedEnv = {
  entries: EnvEntry[];
  duplicates: string[];
  issues: EnvIssue[];
};

const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function stripInlineComment(value: string): string {
  const hashIndex = value.indexOf(' #');
  if (hashIndex === -1) {
    return value.trim();
  }

  return value.slice(0, hashIndex).trim();
}

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

export function parseEnv(text: string): ParsedEnv {
  const lines = text.split(/\r?\n/);
  const entries: EnvEntry[] = [];
  const issues: EnvIssue[] = [];
  const seen = new Map<string, number>();
  const duplicates = new Set<string>();

  lines.forEach((lineText, index) => {
    const lineNumber = index + 1;
    const trimmed = lineText.trim();

    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      return;
    }

    const withoutExport = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const equalsIndex = withoutExport.indexOf('=');

    if (equalsIndex <= 0) {
      return;
    }

    const rawKey = withoutExport.slice(0, equalsIndex).trim();
    const rawValue = withoutExport.slice(equalsIndex + 1);
    const value = unquote(stripInlineComment(rawValue));

    entries.push({ key: rawKey, value, line: lineNumber });

    if (!ENV_KEY_PATTERN.test(rawKey)) {
      issues.push({
        type: 'invalid-key',
        key: rawKey,
        line: lineNumber,
        message: `Invalid key "${rawKey}".`,
      });
    }

    if (value.length === 0) {
      issues.push({
        type: 'empty-value',
        key: rawKey,
        line: lineNumber,
        message: `Key "${rawKey}" has an empty value.`,
      });
    }

    const firstLine = seen.get(rawKey);
    if (firstLine) {
      duplicates.add(rawKey);
      issues.push({
        type: 'duplicate-key',
        key: rawKey,
        line: lineNumber,
        message: `Duplicate key "${rawKey}" also appears on line ${firstLine}.`,
      });
    } else {
      seen.set(rawKey, lineNumber);
    }
  });

  return {
    entries,
    duplicates: [...duplicates],
    issues,
  };
}

function escapeShellValue(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

export function exportEnv(entries: EnvEntry[], format: 'dotenv' | 'json' | 'shell'): string {
  const normalizedEntries = entries
    .map((entry) => ({ key: entry.key.trim(), value: entry.value }))
    .filter((entry) => entry.key.length > 0);

  if (format === 'json') {
    const object = Object.fromEntries(normalizedEntries.map((entry) => [entry.key, entry.value]));
    return JSON.stringify(object, null, 2);
  }

  if (format === 'shell') {
    return normalizedEntries.map((entry) => `export ${entry.key}=${escapeShellValue(entry.value)}`).join('\n');
  }

  return normalizedEntries.map((entry) => `${entry.key}=${entry.value}`).join('\n');
}

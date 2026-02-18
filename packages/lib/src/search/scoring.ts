export function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

export function tokenizeQuery(query: string): string[] {
  const normalized = normalizeSearchText(query);

  if (!normalized) {
    return [];
  }

  return normalized.split(/\s+/).filter(Boolean);
}

export function scoreField(fieldValue: string, tokens: string[]): number {
  const normalizedField = normalizeSearchText(fieldValue);

  if (!normalizedField) {
    return 0;
  }

  let score = 0;

  for (const token of tokens) {
    if (!token) {
      continue;
    }

    if (normalizedField === token) {
      score += 80;
      continue;
    }

    if (normalizedField.startsWith(token)) {
      score += 50;
      continue;
    }

    const index = normalizedField.indexOf(token);
    if (index >= 0) {
      score += Math.max(12, 30 - index);
    }
  }

  return score;
}

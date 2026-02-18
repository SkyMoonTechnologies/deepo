import { diffLines, diffWordsWithSpace } from 'diff';

export type DiffWord = {
  value: string;
  kind: 'equal' | 'added' | 'removed';
};

export type DiffRow = {
  kind: 'equal' | 'added' | 'removed' | 'changed';
  leftLine: number | null;
  rightLine: number | null;
  leftText: string;
  rightText: string;
  leftWords?: DiffWord[];
  rightWords?: DiffWord[];
};

export type DiffTextOptions = {
  ignoreWhitespace?: boolean;
  wordDiff?: boolean;
};

export type DiffTextResult = {
  rows: DiffRow[];
};

type RawRow = Omit<DiffRow, 'kind' | 'leftWords' | 'rightWords'> & {
  kind: 'equal' | 'added' | 'removed';
};

const toLines = (value: string): string[] => {
  if (value.length === 0) {
    return [];
  }

  const normalized = value.endsWith('\n') ? value.slice(0, -1) : value;
  return normalized.length === 0 ? [''] : normalized.split('\n');
};

const buildWordDiff = (left: string, right: string): { leftWords: DiffWord[]; rightWords: DiffWord[] } => {
  const parts = diffWordsWithSpace(left, right);
  const leftWords: DiffWord[] = [];
  const rightWords: DiffWord[] = [];

  for (const part of parts) {
    if (part.added) {
      rightWords.push({ value: part.value, kind: 'added' });
      continue;
    }

    if (part.removed) {
      leftWords.push({ value: part.value, kind: 'removed' });
      continue;
    }

    leftWords.push({ value: part.value, kind: 'equal' });
    rightWords.push({ value: part.value, kind: 'equal' });
  }

  return { leftWords, rightWords };
};

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

export function diffText(a: string, b: string, options: DiffTextOptions = {}): DiffTextResult {
  const rawRows: RawRow[] = [];
  let leftLine = 1;
  let rightLine = 1;

  const parts = diffLines(a, b, {
    ignoreWhitespace: options.ignoreWhitespace ?? false,
    newlineIsToken: false,
  });

  for (const part of parts) {
    const lines = toLines(part.value);

    if (part.added) {
      for (const line of lines) {
        rawRows.push({ kind: 'added', leftLine: null, rightLine, leftText: '', rightText: line });
        rightLine += 1;
      }
      continue;
    }

    if (part.removed) {
      for (const line of lines) {
        rawRows.push({ kind: 'removed', leftLine, rightLine: null, leftText: line, rightText: '' });
        leftLine += 1;
      }
      continue;
    }

    for (const line of lines) {
      rawRows.push({ kind: 'equal', leftLine, rightLine, leftText: line, rightText: line });
      leftLine += 1;
      rightLine += 1;
    }
  }

  const rows: DiffRow[] = [];
  let index = 0;

  while (index < rawRows.length) {
    const row = rawRows[index];

    if (row.kind !== 'removed') {
      rows.push({
        kind: row.kind,
        leftLine: row.leftLine,
        rightLine: row.rightLine,
        leftText: row.leftText,
        rightText: row.rightText,
      });
      index += 1;
      continue;
    }

    let removedEnd = index;
    while (removedEnd < rawRows.length && rawRows[removedEnd]?.kind === 'removed') {
      removedEnd += 1;
    }

    let addedEnd = removedEnd;
    while (addedEnd < rawRows.length && rawRows[addedEnd]?.kind === 'added') {
      addedEnd += 1;
    }

    if (removedEnd === addedEnd) {
      rows.push({
        kind: 'removed',
        leftLine: row.leftLine,
        rightLine: null,
        leftText: row.leftText,
        rightText: '',
      });
      index += 1;
      continue;
    }

    const removedRows = rawRows.slice(index, removedEnd);
    const addedRows = rawRows.slice(removedEnd, addedEnd);
    const pairCount = Math.min(removedRows.length, addedRows.length);

    for (let i = 0; i < pairCount; i += 1) {
      const left = removedRows[i];
      const right = addedRows[i];
      const nextRow: DiffRow = {
        kind: 'changed',
        leftLine: left.leftLine,
        rightLine: right.rightLine,
        leftText: left.leftText,
        rightText: right.rightText,
      };

      if (options.ignoreWhitespace && normalizeWhitespace(left.leftText) === normalizeWhitespace(right.rightText)) {
        nextRow.kind = 'equal';
      }

      if (options.wordDiff) {
        const wordDiff = buildWordDiff(left.leftText, right.rightText);
        nextRow.leftWords = wordDiff.leftWords;
        nextRow.rightWords = wordDiff.rightWords;
      }

      rows.push(nextRow);
    }

    for (let i = pairCount; i < removedRows.length; i += 1) {
      rows.push({
        kind: 'removed',
        leftLine: removedRows[i].leftLine,
        rightLine: null,
        leftText: removedRows[i].leftText,
        rightText: '',
      });
    }

    for (let i = pairCount; i < addedRows.length; i += 1) {
      rows.push({
        kind: 'added',
        leftLine: null,
        rightLine: addedRows[i].rightLine,
        leftText: '',
        rightText: addedRows[i].rightText,
      });
    }

    index = addedEnd;
  }

  return { rows };
}

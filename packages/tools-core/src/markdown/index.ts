import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { createToolError } from '../errors';
import { err, ok, type Result } from '../result';

function normalizeSingleHeadingLine(line: string): string {
  const match = line.match(/^(#{1,6})([^\s#].*)$/);
  if (!match) {
    return line;
  }

  return `${match[1]} ${match[2].trim()}`;
}

export function normalizeHeadings(markdown: string): string {
  return markdown
    .split(/\r?\n/)
    .map((line) => normalizeSingleHeadingLine(line.trimEnd()))
    .join('\n');
}

export function cleanupLinks(markdown: string): string {
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, url: string) => {
    const cleanedUrl = url.trim().replace(/^<|>$/g, '');
    return `[${label.trim()}](${cleanedUrl})`;
  });
}

function normalizeTableCell(cell: string): string {
  return cell.trim();
}

function isLikelyTableLine(line: string): boolean {
  return line.includes('|') && line.trim().startsWith('|') && line.trim().endsWith('|');
}

export function formatTables(markdown: string): string {
  const lines = markdown.split(/\r?\n/);

  return lines
    .map((line) => {
      if (!isLikelyTableLine(line)) {
        return line;
      }

      const cells = line
        .trim()
        .split('|')
        .slice(1, -1)
        .map((cell) => normalizeTableCell(cell));

      return `| ${cells.join(' | ')} |`;
    })
    .join('\n');
}

export function formatMarkdown(markdown: string): string {
  const headings = normalizeHeadings(markdown);
  const links = cleanupLinks(headings);
  return formatTables(links);
}

export function renderMarkdownPreview(markdown: string): Result<string, ReturnType<typeof createToolError>> {
  try {
    const html = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .processSync(markdown)
      .toString();

    return ok(html);
  } catch (error) {
    return err(createToolError('MARKDOWN_PREVIEW_ERROR', error instanceof Error ? error.message : 'Preview failed.'));
  }
}

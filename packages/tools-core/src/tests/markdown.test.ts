import { describe, expect, it } from 'vitest';

import { cleanupLinks, formatMarkdown, formatTables, normalizeHeadings, renderMarkdownPreview } from '../markdown';

describe('markdown tools', () => {
  it('normalizes headings', () => {
    expect(normalizeHeadings('##Heading')).toBe('## Heading');
  });

  it('cleans up links', () => {
    expect(cleanupLinks('[docs]( https://example.com )')).toBe('[docs](https://example.com)');
  });

  it('formats tables best effort', () => {
    expect(formatTables('|a| b |\n| - | - |')).toBe('| a | b |\n| - | - |');
  });

  it('renders markdown preview html', () => {
    const result = renderMarkdownPreview(formatMarkdown('# Title\n\n- one'));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('<h1>Title</h1>');
      expect(result.value).toContain('<li>one</li>');
    }
  });
});

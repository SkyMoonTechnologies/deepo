'use client';

import MarkdownTemplateTool from '@/components/tools/MarkdownTemplateTool';
import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';
import { generateReleaseNotes } from '@deepo/tools-core';

type ToolClientProps = {
  panel: ToolPanel;
};

export default function ToolClient({ panel }: ToolClientProps) {
  return (
    <MarkdownTemplateTool
      panel={panel}
      toolId="release-notes"
      title="Release Notes"
      fields={[
        { key: 'version', label: 'Version' },
        { key: 'date', label: 'Date' },
        { key: 'mode', label: 'Mode (customer/internal)' },
        { key: 'highlights', label: 'Highlights (one per line)', multiline: true },
        { key: 'fixes', label: 'Fixes (one per line)', multiline: true },
        { key: 'internalNotes', label: 'Internal notes (one per line)', multiline: true },
      ]}
      initialState={{ version: 'v1.0.0', date: new Date().toISOString().slice(0, 10), mode: 'customer', highlights: '', fixes: '', internalNotes: '' }}
      generate={(state) =>
        generateReleaseNotes(
          {
            version: state.version,
            date: state.date,
            highlights: state.highlights,
            fixes: state.fixes,
            internalNotes: state.internalNotes,
          },
          { mode: state.mode === 'internal' ? 'internal' : 'customer' },
        )
      }
    />
  );
}

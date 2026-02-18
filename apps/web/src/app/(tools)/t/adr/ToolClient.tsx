'use client';

import MarkdownTemplateTool from '@/components/tools/MarkdownTemplateTool';
import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';
import { generateADR } from '@deepo/tools-core';

type ToolClientProps = {
  panel: ToolPanel;
};

export default function ToolClient({ panel }: ToolClientProps) {
  return (
    <MarkdownTemplateTool
      panel={panel}
      toolId="adr"
      title="ADR"
      fields={[
        { key: 'title', label: 'Decision title' },
        { key: 'status', label: 'Status' },
        { key: 'context', label: 'Context', multiline: true },
        { key: 'decision', label: 'Decision', multiline: true },
        { key: 'consequences', label: 'Consequences (one per line)', multiline: true },
      ]}
      initialState={{ title: 'Architecture decision', status: 'Proposed', context: '', decision: '', consequences: '' }}
      generate={(state) =>
        generateADR({
          title: state.title,
          status: state.status,
          context: state.context,
          decision: state.decision,
          consequences: state.consequences,
        })
      }
    />
  );
}

'use client';

import MarkdownTemplateTool from '@/components/tools/MarkdownTemplateTool';
import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';
import { generateWeeklyStatus } from '@deepo/tools-core';

type ToolClientProps = {
  panel: ToolPanel;
};

export default function ToolClient({ panel }: ToolClientProps) {
  return (
    <MarkdownTemplateTool
      panel={panel}
      toolId="weekly-status"
      title="Weekly Status"
      fields={[
        { key: 'title', label: 'Title' },
        { key: 'period', label: 'Period' },
        { key: 'highlights', label: 'Highlights (one per line)', multiline: true },
        { key: 'blockers', label: 'Blockers (one per line)', multiline: true },
        { key: 'nextSteps', label: 'Next steps (one per line)', multiline: true },
      ]}
      initialState={{ title: 'Team Update', period: '2026-W07', highlights: '', blockers: '', nextSteps: '' }}
      generate={(state) =>
        generateWeeklyStatus({
          title: state.title,
          period: state.period,
          highlights: state.highlights,
          blockers: state.blockers,
          nextSteps: state.nextSteps,
        })
      }
    />
  );
}

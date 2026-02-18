'use client';

import MarkdownTemplateTool from '@/components/tools/MarkdownTemplateTool';
import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';
import { generatePRDOnePager } from '@deepo/tools-core';

type ToolClientProps = {
  panel: ToolPanel;
};

export default function ToolClient({ panel }: ToolClientProps) {
  return (
    <MarkdownTemplateTool
      panel={panel}
      toolId="prd"
      title="PRD"
      fields={[
        { key: 'product', label: 'Product' },
        { key: 'problem', label: 'Problem statement', multiline: true },
        { key: 'goals', label: 'Goals (one per line)', multiline: true },
        { key: 'nonGoals', label: 'Non-goals (one per line)', multiline: true },
        { key: 'requirements', label: 'Requirements (one per line)', multiline: true },
        { key: 'metrics', label: 'Success metrics (one per line)', multiline: true },
      ]}
      initialState={{ product: 'Deepo', problem: '', goals: '', nonGoals: '', requirements: '', metrics: '' }}
      generate={(state) =>
        generatePRDOnePager({
          product: state.product,
          problem: state.problem,
          goals: state.goals,
          nonGoals: state.nonGoals,
          requirements: state.requirements,
          metrics: state.metrics,
        })
      }
    />
  );
}

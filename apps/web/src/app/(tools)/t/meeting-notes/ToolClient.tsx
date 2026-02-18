'use client';

import MarkdownTemplateTool from '@/components/tools/MarkdownTemplateTool';
import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';
import { generateMeetingNotes } from '@deepo/tools-core';

type ToolClientProps = {
  panel: ToolPanel;
};

export default function ToolClient({ panel }: ToolClientProps) {
  return (
    <MarkdownTemplateTool
      panel={panel}
      toolId="meeting-notes"
      title="Meeting Notes"
      fields={[
        { key: 'title', label: 'Meeting title' },
        { key: 'date', label: 'Date' },
        { key: 'attendees', label: 'Attendees (one per line)', multiline: true },
        { key: 'agenda', label: 'Agenda (one per line)', multiline: true },
        { key: 'decisions', label: 'Decisions (one per line)', multiline: true },
        { key: 'actionItems', label: 'Action items (one per line)', multiline: true },
      ]}
      initialState={{ title: 'Weekly Sync', date: new Date().toISOString().slice(0, 10), attendees: '', agenda: '', decisions: '', actionItems: '' }}
      generate={(state) =>
        generateMeetingNotes({
          title: state.title,
          date: state.date,
          attendees: state.attendees,
          agenda: state.agenda,
          decisions: state.decisions,
          actionItems: state.actionItems,
        })
      }
    />
  );
}

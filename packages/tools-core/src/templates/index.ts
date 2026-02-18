export type ReleaseNotesMode = 'customer' | 'internal';

const splitList = (raw: string): string[] =>
  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const bullets = (raw: string): string => {
  const lines = splitList(raw);
  if (lines.length === 0) {
    return '- None';
  }

  return lines.map((line) => `- ${line}`).join('\n');
};

export const generateWeeklyStatus = (data: {
  title: string;
  period: string;
  highlights: string;
  blockers: string;
  nextSteps: string;
}): string => `# Weekly Status: ${data.title || 'Update'}

## Period
${data.period || 'TBD'}

## Highlights
${bullets(data.highlights)}

## Blockers
${bullets(data.blockers)}

## Next Steps
${bullets(data.nextSteps)}
`;

export const generateMeetingNotes = (data: {
  title: string;
  date: string;
  attendees: string;
  agenda: string;
  decisions: string;
  actionItems: string;
}): string => `# Meeting Notes: ${data.title || 'Session'}

## Date
${data.date || 'TBD'}

## Attendees
${bullets(data.attendees)}

## Agenda
${bullets(data.agenda)}

## Decisions
${bullets(data.decisions)}

## Action Items
${bullets(data.actionItems)}
`;

export const generatePRDOnePager = (data: {
  product: string;
  problem: string;
  goals: string;
  nonGoals: string;
  requirements: string;
  metrics: string;
}): string => `# PRD One-Pager: ${data.product || 'Untitled'}

## Problem
${data.problem || 'TBD'}

## Goals
${bullets(data.goals)}

## Non-Goals
${bullets(data.nonGoals)}

## Requirements
${bullets(data.requirements)}

## Success Metrics
${bullets(data.metrics)}
`;

export const generateADR = (data: {
  title: string;
  status: string;
  context: string;
  decision: string;
  consequences: string;
}): string => `# ADR: ${data.title || 'Decision'}

## Status
${data.status || 'Proposed'}

## Context
${data.context || 'TBD'}

## Decision
${data.decision || 'TBD'}

## Consequences
${bullets(data.consequences)}
`;

export const generateReleaseNotes = (
  data: {
    version: string;
    date: string;
    highlights: string;
    fixes: string;
    internalNotes: string;
  },
  options: { mode: ReleaseNotesMode },
): string => {
  if (options.mode === 'customer') {
    return `# Release Notes ${data.version || ''}

## Date
${data.date || 'TBD'}

## Highlights
${bullets(data.highlights)}

## Fixes
${bullets(data.fixes)}
`;
  }

  return `# Internal Release Notes ${data.version || ''}

## Date
${data.date || 'TBD'}

## Highlights
${bullets(data.highlights)}

## Fixes
${bullets(data.fixes)}

## Internal Notes
${bullets(data.internalNotes)}
`;
};

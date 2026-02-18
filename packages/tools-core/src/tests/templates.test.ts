import { describe, expect, it } from 'vitest';

import {
  generateADR,
  generateMeetingNotes,
  generatePRDOnePager,
  generateReleaseNotes,
  generateWeeklyStatus,
} from '../templates';

describe('templates', () => {
  it('generates weekly status markdown', () => {
    const markdown = generateWeeklyStatus({
      title: 'Platform',
      period: '2026-W07',
      highlights: 'Shipped API',
      blockers: 'None',
      nextSteps: 'Plan sprint',
    });

    expect(markdown).toContain('# Weekly Status: Platform');
    expect(markdown).toContain('## Highlights');
  });

  it('generates meeting notes markdown', () => {
    const markdown = generateMeetingNotes({
      title: 'Weekly Sync',
      date: '2026-02-17',
      attendees: 'Ava\nLiam',
      agenda: 'Roadmap',
      decisions: 'Ship v1',
      actionItems: 'Write docs',
    });

    expect(markdown).toContain('## Attendees');
  });

  it('generates PRD and ADR markdown', () => {
    const prd = generatePRDOnePager({
      product: 'Deepo',
      problem: 'Slow setup',
      goals: 'Fast onboarding',
      nonGoals: 'Desktop app',
      requirements: 'CLI',
      metrics: 'Activation',
    });
    const adr = generateADR({
      title: 'Storage choice',
      status: 'Accepted',
      context: 'Need durability',
      decision: 'Use postgres',
      consequences: 'Manage migrations',
    });

    expect(prd).toContain('# PRD One-Pager: Deepo');
    expect(adr).toContain('# ADR: Storage choice');
  });

  it('supports customer and internal release modes', () => {
    const customer = generateReleaseNotes(
      { version: 'v1.2.0', date: '2026-02-17', highlights: 'Faster app', fixes: 'Login bug', internalNotes: 'none' },
      { mode: 'customer' },
    );
    const internal = generateReleaseNotes(
      { version: 'v1.2.0', date: '2026-02-17', highlights: 'Faster app', fixes: 'Login bug', internalNotes: 'rollback plan' },
      { mode: 'internal' },
    );

    expect(customer).not.toContain('Internal Notes');
    expect(internal).toContain('Internal Notes');
  });
});

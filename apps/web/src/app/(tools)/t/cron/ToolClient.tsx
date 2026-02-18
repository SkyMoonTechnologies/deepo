'use client';

import { Button } from '@/components/ui/button';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { describeCron, nextRuns, validateCron } from '@deepo/tools-core';
import { ToolShell } from '@deepo/ui';
import { useState } from 'react';

type CronState = {
  expression: string;
  timezone: string;
};

const PRESETS: Array<{ label: string; expression: string }> = [
  { label: 'Every 5 minutes', expression: '*/5 * * * *' },
  { label: 'Hourly', expression: '0 * * * *' },
  { label: 'Daily at 09:00', expression: '0 9 * * *' },
  { label: 'Weekdays 09:00', expression: '0 9 * * 1-5' },
];

function decodeState(): CronState {
  const params = new globalThis.URLSearchParams(globalThis.window.location.search);

  return {
    expression: params.get('expr') ?? '*/5 * * * *',
    timezone: params.get('tz') ?? 'UTC',
  };
}

function encodeState(state: CronState): string {
  const params = new globalThis.URLSearchParams();

  if (state.expression) {
    params.set('expr', state.expression);
  }
  if (state.timezone) {
    params.set('tz', state.timezone);
  }

  return params.toString();
}

export default function ToolClient() {
  const [state, setState] = useState<CronState>(() => decodeState());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const validation = validateCron(state.expression);
  const description = describeCron(state.expression);
  const upcoming = validation.ok ? nextRuns(state.expression, { tz: state.timezone, count: 10 }) : null;

  const setNextState = (nextState: CronState) => {
    setState(nextState);

    const query = encodeState(nextState);
    const nextHref = query ? `${globalThis.window.location.pathname}?${query}` : globalThis.window.location.pathname;
    globalThis.window.history.replaceState(null, '', nextHref);
  };

  const handleCopyPermalink = async () => {
    if (!globalThis.navigator?.clipboard) {
      return;
    }

    const query = encodeState(state);
    const href = query ? `${globalThis.window.location.pathname}?${query}` : globalThis.window.location.pathname;
    const absolute = new globalThis.URL(href, globalThis.window.location.origin).toString();

    try {
      await globalThis.navigator.clipboard.writeText(absolute);
      setStatusMessage('Permalink copied.');
      notifyAction('copy', 'Permalink copied to clipboard.');
    } catch {
      notifyActionError('Copy permalink');
    }
  };

  return (
    <ToolShell
      title="Cron Helper"
      description="Validate cron expressions, explain schedules, and inspect the next 10 runs."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleCopyPermalink}>
            Copy Permalink
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setNextState({ expression: '', timezone: 'UTC' })}>
            Clear
          </Button>
        </>
      }
      left={
        <div className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="cron-expression">
            Cron expression
          </label>
          <input
            id="cron-expression"
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            value={state.expression}
            onChange={(event) => setNextState({ ...state, expression: event.target.value })}
          />

          <label className="block text-sm font-medium" htmlFor="cron-timezone">
            Timezone
          </label>
          <input
            id="cron-timezone"
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            value={state.timezone}
            onChange={(event) => setNextState({ ...state, timezone: event.target.value })}
            placeholder="UTC"
          />

          <div className="space-y-2 rounded-md border border-border/70 p-3">
            <h2 className="text-sm font-semibold">Presets</h2>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.expression}
                  variant="outline"
                  size="sm"
                  onClick={() => setNextState({ ...state, expression: preset.expression })}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      }
      right={
        <div className="space-y-4">
          {!validation.ok ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {validation.error.message}
            </p>
          ) : (
            <>
              <div className="rounded-md border border-border/70 p-3">
                <h2 className="text-sm font-semibold">Description</h2>
                <p className="mt-1 text-sm">{description}</p>
              </div>

              <div className="rounded-md border border-border/70 p-3">
                <h2 className="text-sm font-semibold">Next 10 runs</h2>
                {upcoming?.ok ? (
                  <ol className="mt-2 list-decimal space-y-1 pl-5 font-mono text-xs">
                    {upcoming.value.map((runDate, index) => (
                      <li key={`${runDate.toISOString()}-${index}`}>{runDate.toISOString()}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-1 text-sm text-destructive">{upcoming?.error.message}</p>
                )}
              </div>
            </>
          )}

          {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
        </div>
      }
    />
  );
}

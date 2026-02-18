'use client';

import { Button } from '@/components/ui/button';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { formatTimestampOutputs, listCommonTimezones, parseTimestamp } from '@deepo/tools-core';
import { ToolShell } from '@deepo/ui';
import { useState } from 'react';

type TimestampState = {
  input: string;
  timezone: string;
  customFormat: string;
};

function decodeState(): TimestampState {
  const params = new globalThis.URLSearchParams(globalThis.window.location.search);

  return {
    input: params.get('input') ?? '',
    timezone: params.get('tz') ?? 'UTC',
    customFormat: params.get('fmt') ?? 'yyyy-LL-dd HH:mm:ss ZZZZ',
  };
}

function encodeState(state: TimestampState): string {
  const params = new globalThis.URLSearchParams();

  if (state.input) {
    params.set('input', state.input);
  }
  if (state.timezone) {
    params.set('tz', state.timezone);
  }
  if (state.customFormat) {
    params.set('fmt', state.customFormat);
  }

  return params.toString();
}

export default function ToolClient() {
  const [state, setState] = useState<TimestampState>(() => decodeState());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const parsed = parseTimestamp(state.input);
  const outputs = parsed.ok
    ? formatTimestampOutputs(parsed.value.dateTime, {
        timezone: state.timezone,
        customFormat: state.customFormat,
      })
    : null;

  const setNextState = (nextState: TimestampState) => {
    setState(nextState);

    const query = encodeState(nextState);
    const nextHref = query ? `${globalThis.window.location.pathname}?${query}` : globalThis.window.location.pathname;
    globalThis.window.history.replaceState(null, '', nextHref);
  };

  const handleCopy = async (value: string, label: string) => {
    if (!value || !globalThis.navigator?.clipboard) {
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(value);
      setStatusMessage(`${label} copied.`);
      notifyAction('copy', `${label} copied to clipboard.`);
    } catch {
      notifyActionError('Copy');
    }
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
      title="Timestamp Converter"
      description="Parse unix/ISO timestamps and convert them across timezones and output formats."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleCopyPermalink}>
            Copy Permalink
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setNextState({ input: '', timezone: 'UTC', customFormat: 'yyyy-LL-dd HH:mm:ss ZZZZ' })}
          >
            Clear
          </Button>
        </>
      }
      left={
        <div className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="timestamp-input">
            Timestamp input
          </label>
          <input
            id="timestamp-input"
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            placeholder="1700000000 or 2024-03-01T10:00:00Z"
            value={state.input}
            onChange={(event) => setNextState({ ...state, input: event.target.value })}
          />

          <label className="block text-sm font-medium" htmlFor="timestamp-timezone">
            Timezone
          </label>
          <input
            id="timestamp-timezone"
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            list="common-timezones"
            value={state.timezone}
            onChange={(event) => setNextState({ ...state, timezone: event.target.value })}
          />
          <datalist id="common-timezones">
            {listCommonTimezones().map((zone) => (
              <option key={zone} value={zone} />
            ))}
          </datalist>

          <label className="block text-sm font-medium" htmlFor="timestamp-format">
            Custom format string
          </label>
          <input
            id="timestamp-format"
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            value={state.customFormat}
            onChange={(event) => setNextState({ ...state, customFormat: event.target.value })}
          />
        </div>
      }
      right={
        <div className="space-y-4">
          {!parsed.ok ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {parsed.error.message}
            </p>
          ) : outputs ? (
            <div className="space-y-3">
              <div className="rounded-md border border-border/70 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">ISO</h2>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(outputs.iso, 'ISO')}>
                    Copy
                  </Button>
                </div>
                <p className="font-mono text-sm">{outputs.iso}</p>
              </div>

              <div className="rounded-md border border-border/70 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">RFC2822</h2>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(outputs.rfc2822, 'RFC2822')}>
                    Copy
                  </Button>
                </div>
                <p className="font-mono text-sm">{outputs.rfc2822}</p>
              </div>

              <div className="rounded-md border border-border/70 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Relative</h2>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(outputs.relative, 'Relative value')}>
                    Copy
                  </Button>
                </div>
                <p className="font-mono text-sm">{outputs.relative}</p>
              </div>

              <div className="rounded-md border border-border/70 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Custom</h2>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(outputs.custom, 'Custom value')}>
                    Copy
                  </Button>
                </div>
                <p className="font-mono text-sm">{outputs.custom}</p>
              </div>
            </div>
          ) : null}

          {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
        </div>
      }
    />
  );
}

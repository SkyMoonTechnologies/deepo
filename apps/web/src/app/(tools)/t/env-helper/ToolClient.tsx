'use client';

import { Button } from '@/components/ui/button';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { saveToolCard } from '@/lib/client-db';
import { exportEnv, parseEnv } from '@deepo/tools-core';
import { ToolShell } from '@deepo/ui';
import { useState } from 'react';

type ExportFormat = 'dotenv' | 'json' | 'shell';

type EnvState = {
  input: string;
  format: ExportFormat;
};

const MAX_SHAREABLE_INPUT = 40 * 1024;

function decodeState(): EnvState {
  const params = new globalThis.URLSearchParams(globalThis.window.location.search);

  const format = params.get('format');
  const normalizedFormat: ExportFormat =
    format === 'json' || format === 'shell' || format === 'dotenv' ? format : 'dotenv';

  return {
    input: params.get('input') ?? '',
    format: normalizedFormat,
  };
}

function encodeState(state: EnvState): string {
  const params = new globalThis.URLSearchParams();

  if (state.input) {
    params.set('input', state.input);
  }
  params.set('format', state.format);

  return params.toString();
}

export default function ToolClient() {
  const [state, setState] = useState<EnvState>(() => decodeState());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const parsed = parseEnv(state.input);
  const exported = exportEnv(parsed.entries, state.format);
  const canShare = state.input.length < MAX_SHAREABLE_INPUT;

  const setNextState = (nextState: EnvState) => {
    setState(nextState);

    const query = canShare ? encodeState(nextState) : '';
    const nextHref = query ? `${globalThis.window.location.pathname}?${query}` : globalThis.window.location.pathname;
    globalThis.window.history.replaceState(null, '', nextHref);
  };

  const handleCopy = async () => {
    if (!exported || !globalThis.navigator?.clipboard) {
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(exported);
      setStatusMessage('Export copied.');
      notifyAction('copy', 'Export copied to clipboard.');
    } catch {
      notifyActionError('Copy');
    }
  };

  const handleDownload = () => {
    if (!exported) {
      return;
    }

    try {
      const extension = state.format === 'json' ? 'json' : 'txt';
      const blob = new globalThis.Blob([exported], { type: 'text/plain;charset=utf-8' });
      const url = globalThis.URL.createObjectURL(blob);
      const anchor = globalThis.document.createElement('a');
      anchor.href = url;
      anchor.download = `env-export.${extension}`;
      anchor.click();
      globalThis.URL.revokeObjectURL(url);
      notifyAction('download', `env-export.${extension} is ready.`);
    } catch {
      notifyActionError('Download');
    }
  };

  const handleSaveCard = async () => {
    try {
      await saveToolCard({
        id: globalThis.crypto.randomUUID(),
        toolId: 'env-helper',
        title: `ENV Helper ${new Date().toISOString()}`,
        payload: {
          format: state.format,
          issues: parsed.issues,
          exported,
        },
      });

      setStatusMessage('Card saved locally.');
      notifyAction('save', 'Card saved locally.');
    } catch {
      notifyActionError('Save card');
    }
  };

  const handleCopyPermalink = async () => {
    if (!canShare || !globalThis.navigator?.clipboard) {
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
      title="ENV Helper"
      description="Parse .env text, detect duplicates/issues, and export in dotenv/json/shell formats."
      shareWarning={!canShare ? 'Permalink disabled: input exceeds 40KB.' : undefined}
      actions={
        <>
          <Button variant="outline" size="sm" disabled={!canShare} onClick={handleCopyPermalink}>
            Copy Permalink
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveCard}>
            Save card
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setNextState({ input: '', format: 'dotenv' })}>
            Clear
          </Button>
        </>
      }
      left={
        <div className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="env-input">
            .env input
          </label>
          <textarea
            id="env-input"
            className="h-[28rem] w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            value={state.input}
            onChange={(event) => setNextState({ ...state, input: event.target.value })}
            spellCheck={false}
          />

          <label className="block text-sm font-medium" htmlFor="env-format">
            Export format
          </label>
          <select
            id="env-format"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={state.format}
            onChange={(event) => setNextState({ ...state, format: event.target.value as ExportFormat })}
          >
            <option value="dotenv">dotenv</option>
            <option value="json">json</option>
            <option value="shell">shell</option>
          </select>
        </div>
      }
      right={
        <div className="space-y-4">
          <div className="rounded-md border border-border/70 p-3">
            <h2 className="text-sm font-semibold">Duplicates</h2>
            {parsed.duplicates.length > 0 ? (
              <ul className="mt-1 list-disc pl-5 text-sm">
                {parsed.duplicates.map((key) => (
                  <li key={key} className="font-mono">
                    {key}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No duplicates.</p>
            )}
          </div>

          <div className="rounded-md border border-border/70 p-3">
            <h2 className="text-sm font-semibold">Issues</h2>
            {parsed.issues.length > 0 ? (
              <ul className="mt-1 space-y-1 text-sm">
                {parsed.issues.map((issue, index) => (
                  <li key={`${issue.line}-${issue.key}-${index}`}>
                    Line {issue.line}: {issue.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No issues found.</p>
            )}
          </div>

          <div className="rounded-md border border-border/70 p-3">
            <h2 className="text-sm font-semibold">Export preview</h2>
            <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap rounded bg-muted/30 p-2 font-mono text-xs">
              {exported}
            </pre>
          </div>

          {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
        </div>
      }
    />
  );
}

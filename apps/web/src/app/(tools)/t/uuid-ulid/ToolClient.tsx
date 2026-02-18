'use client';

import { Button } from '@/components/ui/button';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { saveToolCard } from '@/lib/client-db';
import { generateUlid, generateUuidV4, validateUlid, validateUuid } from '@deepo/tools-core';
import { ToolShell } from '@deepo/ui';
import { useState } from 'react';

type IdMode = 'uuid' | 'ulid';

type IdState = {
  mode: IdMode;
  count: number;
  validatorInput: string;
  generated: string[];
};

function decodeState(): IdState {
  const params = new globalThis.URLSearchParams(globalThis.window.location.search);
  const mode = params.get('mode') === 'ulid' ? 'ulid' : 'uuid';
  const count = Number(params.get('count') ?? '5');

  return {
    mode,
    count: Number.isFinite(count) && count > 0 ? Math.min(200, Math.floor(count)) : 5,
    validatorInput: params.get('value') ?? '',
    generated: [],
  };
}

function encodeState(state: IdState): string {
  const params = new globalThis.URLSearchParams();
  params.set('mode', state.mode);
  params.set('count', String(state.count));
  if (state.validatorInput) {
    params.set('value', state.validatorInput);
  }
  return params.toString();
}

export default function ToolClient() {
  const [state, setState] = useState<IdState>(() => decodeState());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isValid = state.validatorInput
    ? state.mode === 'uuid'
      ? validateUuid(state.validatorInput)
      : validateUlid(state.validatorInput)
    : null;

  const setNextState = (nextState: IdState) => {
    setState(nextState);

    const query = encodeState(nextState);
    const nextHref = query ? `${globalThis.window.location.pathname}?${query}` : globalThis.window.location.pathname;
    globalThis.window.history.replaceState(null, '', nextHref);
  };

  const handleGenerate = () => {
    const generated = state.mode === 'uuid' ? generateUuidV4(state.count) : generateUlid(state.count);
    setNextState({ ...state, generated });
  };

  const handleCopyGenerated = async () => {
    if (!state.generated.length || !globalThis.navigator?.clipboard) {
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(state.generated.join('\n'));
      setStatusMessage('Generated IDs copied.');
      notifyAction('copy', 'Generated IDs copied to clipboard.');
    } catch {
      notifyActionError('Copy');
    }
  };

  const handleDownload = () => {
    if (!state.generated.length) {
      return;
    }

    try {
      const filename = state.mode === 'uuid' ? 'uuid.txt' : 'ulid.txt';
      const blob = new globalThis.Blob([state.generated.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = globalThis.URL.createObjectURL(blob);
      const anchor = globalThis.document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      globalThis.URL.revokeObjectURL(url);
      notifyAction('download', `${filename} is ready.`);
    } catch {
      notifyActionError('Download');
    }
  };

  const handleSaveCard = async () => {
    if (!state.generated.length) {
      return;
    }

    try {
      await saveToolCard({
        id: globalThis.crypto.randomUUID(),
        toolId: 'uuid-ulid',
        title: `${state.mode.toUpperCase()} batch ${new Date().toISOString()}`,
        payload: {
          mode: state.mode,
          count: state.count,
          generated: state.generated,
        },
      });

      setStatusMessage('Card saved locally.');
      notifyAction('save', 'Card saved locally.');
    } catch {
      notifyActionError('Save card');
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
      title="UUID and ULID"
      description="Generate batches, validate identifier strings, and export results."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleCopyPermalink}>
            Copy Permalink
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyGenerated} disabled={state.generated.length === 0}>
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={state.generated.length === 0}>
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveCard} disabled={state.generated.length === 0}>
            Save card
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setNextState({ mode: 'uuid', count: 5, validatorInput: '', generated: [] })}
          >
            Clear
          </Button>
        </>
      }
      left={
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant={state.mode === 'uuid' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setNextState({ ...state, mode: 'uuid' })}
            >
              UUID
            </Button>
            <Button
              variant={state.mode === 'ulid' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setNextState({ ...state, mode: 'ulid' })}
            >
              ULID
            </Button>
          </div>

          <label className="block text-sm font-medium" htmlFor="id-count">
            Batch count
          </label>
          <input
            id="id-count"
            type="number"
            min={1}
            max={200}
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            value={state.count}
            onChange={(event) =>
              setNextState({
                ...state,
                count: Math.max(1, Math.min(200, Number(event.target.value) || 1)),
              })
            }
          />

          <Button onClick={handleGenerate}>Generate</Button>

          <label className="block text-sm font-medium" htmlFor="id-validator">
            Validator input
          </label>
          <input
            id="id-validator"
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            placeholder={state.mode === 'uuid' ? '550e8400-e29b-41d4-a716-446655440000' : '01ARZ3NDEKTSV4RRFFQ69G5FAV'}
            value={state.validatorInput}
            onChange={(event) => setNextState({ ...state, validatorInput: event.target.value })}
          />
          {isValid !== null ? (
            <p className={`text-sm ${isValid ? 'text-emerald-700 dark:text-emerald-300' : 'text-destructive'}`}>
              {isValid ? 'Valid identifier' : 'Invalid identifier'}
            </p>
          ) : null}
        </div>
      }
      right={
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Generated values ({state.generated.length})</h2>
          <pre className="min-h-56 whitespace-pre-wrap rounded-md border border-border/70 bg-muted/30 p-3 font-mono text-xs">
            {state.generated.join('\n')}
          </pre>
          {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
        </div>
      }
    />
  );
}

'use client';

import { saveToolCard } from '@/lib/client-db';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { Button } from '@/components/ui/button';
import {
  transformText,
  type EncoderDirection,
  type EncoderMode,
} from '@deepo/tools-core';
import { ToolShell } from '@deepo/ui';
import { useState } from 'react';

const MAX_SHAREABLE_INPUT_SIZE = 20 * 1024;

type UrlState = {
  input: string;
  mode: EncoderMode;
  direction: EncoderDirection;
};

const MODE_OPTIONS: Array<{ value: EncoderMode; label: string }> = [
  { value: 'base64', label: 'Base64' },
  { value: 'url', label: 'URL' },
  { value: 'html', label: 'HTML' },
];

const DIRECTION_OPTIONS: Array<{ value: EncoderDirection; label: string }> = [
  { value: 'encode', label: 'Encode' },
  { value: 'decode', label: 'Decode' },
];

function parseMode(value: string | null): EncoderMode {
  if (value === 'url' || value === 'html' || value === 'base64') {
    return value;
  }

  return 'base64';
}

function parseDirection(value: string | null): EncoderDirection {
  if (value === 'decode' || value === 'encode') {
    return value;
  }

  return 'encode';
}

function decodeInitialState(): UrlState {
  const search = typeof globalThis.window === 'undefined' ? '' : globalThis.window.location.search;
  const params = new globalThis.URLSearchParams(search);

  return {
    input: params.get('i') ?? '',
    mode: parseMode(params.get('m')),
    direction: parseDirection(params.get('d')),
  };
}

function encodeState(state: UrlState): string {
  const params = new globalThis.URLSearchParams();

  params.set('m', state.mode);
  params.set('d', state.direction);

  if (state.input.length > 0 && state.input.length < MAX_SHAREABLE_INPUT_SIZE) {
    params.set('i', state.input);
  }

  return params.toString();
}

function buildPermalink(state: UrlState): string {
  const query = encodeState(state);
  const path = query.length > 0 ? `${globalThis.window.location.pathname}?${query}` : globalThis.window.location.pathname;

  return new globalThis.URL(path, globalThis.window.location.origin).toString();
}

export default function ToolClient() {
  const [state, setState] = useState<UrlState>(() => decodeInitialState());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const transformed = transformText(state.mode, state.direction, state.input);
  const output = transformed.ok ? transformed.value : '';
  const canShare = state.input.length < MAX_SHAREABLE_INPUT_SIZE;

  const setNextState = (nextState: UrlState) => {
    setState(nextState);

    const query = encodeState(nextState);
    const nextUrl = query.length > 0 ? `${globalThis.window.location.pathname}?${query}` : globalThis.window.location.pathname;
    globalThis.window.history.replaceState(null, '', nextUrl);
  };

  const handleInputChange = (nextInput: string) => {
    setStatusMessage(null);
    setNextState({
      input: nextInput,
      mode: state.mode,
      direction: state.direction,
    });
  };

  const handleModeChange = (nextMode: EncoderMode) => {
    setStatusMessage(null);
    setNextState({
      input: state.input,
      mode: nextMode,
      direction: state.direction,
    });
  };

  const handleDirectionChange = (nextDirection: EncoderDirection) => {
    setStatusMessage(null);
    setNextState({
      input: state.input,
      mode: state.mode,
      direction: nextDirection,
    });
  };

  const handleClear = () => {
    setStatusMessage(null);
    setNextState({
      input: '',
      mode: 'base64',
      direction: 'encode',
    });
  };

  const handleCopyOutput = async () => {
    if (!transformed.ok || output.length === 0 || !globalThis.navigator?.clipboard) {
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(output);
      setStatusMessage('Output copied.');
      notifyAction('copy', 'Output copied to clipboard.');
    } catch {
      notifyActionError('Copy output');
    }
  };

  const handleCopyPermalink = async () => {
    if (!canShare || !globalThis.navigator?.clipboard) {
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(buildPermalink(state));
      setStatusMessage('Permalink copied.');
      notifyAction('copy', 'Permalink copied to clipboard.');
    } catch {
      notifyActionError('Copy permalink');
    }
  };

  const handleDownload = () => {
    if (!transformed.ok || output.length === 0) {
      return;
    }

    try {
      const blob = new globalThis.Blob([output], { type: 'text/plain;charset=utf-8' });
      const url = globalThis.URL.createObjectURL(blob);
      const anchor = globalThis.document.createElement('a');
      anchor.href = url;
      anchor.download = 'encoded-output.txt';
      anchor.click();
      globalThis.URL.revokeObjectURL(url);
      notifyAction('download', 'encoded-output.txt is ready.');
    } catch {
      notifyActionError('Download');
    }
  };

  const handleSaveCard = async () => {
    if (!transformed.ok || output.length === 0) {
      return;
    }

    const inputTooLarge = state.input.length >= MAX_SHAREABLE_INPUT_SIZE;

    try {
      await saveToolCard({
        id: globalThis.crypto.randomUUID(),
        toolId: 'encoders',
        title: `Encoders ${new Date().toISOString()}`,
        payload: {
          mode: state.mode,
          direction: state.direction,
          output,
          inputTooLarge,
          ...(inputTooLarge ? {} : { input: state.input }),
        },
      });

      setStatusMessage('Card saved locally.');
      notifyAction('save', 'Card saved locally.');
    } catch {
      notifyActionError('Save card');
    }
  };

  return (
    <ToolShell
      title="Encoders"
      description="Encode and decode Base64, URL, and HTML text formats."
      shareWarning={
        canShare
          ? undefined
          : 'Permalink excludes input because it is 20KB or larger. Keep input below 20KB for share-safe links.'
      }
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleCopyPermalink} disabled={!canShare}>
            Copy permalink
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyOutput} disabled={!transformed.ok || output.length === 0}>
            Copy output
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!transformed.ok || output.length === 0}>
            Download .txt
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveCard} disabled={!transformed.ok || output.length === 0}>
            Save card
          </Button>
          <Button variant="secondary" size="sm" onClick={handleClear}>
            Clear
          </Button>
        </>
      }
      left={
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium" htmlFor="encoder-mode">
              <span>Mode</span>
              <select
                id="encoder-mode"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={state.mode}
                onChange={(event) => handleModeChange(event.target.value as EncoderMode)}
              >
                {MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium" htmlFor="encoder-direction">
              <span>Direction</span>
              <select
                id="encoder-direction"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={state.direction}
                onChange={(event) => handleDirectionChange(event.target.value as EncoderDirection)}
              >
                {DIRECTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium" htmlFor="encoder-input">
            Input text
          </label>
          <textarea
            id="encoder-input"
            className="h-[28rem] w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            value={state.input}
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder="Enter text to transform"
            spellCheck={false}
          />
          {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
        </div>
      }
      right={
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Output text</h2>
          <textarea
            className="h-[32rem] w-full rounded-md border border-input bg-muted/30 p-3 font-mono text-sm"
            value={output}
            readOnly
            spellCheck={false}
          />
          {transformed.ok ? null : (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {transformed.error.message}
            </p>
          )}
        </div>
      }
    />
  );
}

'use client';

import { saveToolCard } from '@/lib/client-db';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { Button } from '@/components/ui/button';
import { formatJson, parseJson, validateJson } from '@deepo/tools-core';
import { ToolShell } from '@deepo/ui';
import { JsonTree } from '@deepo/ui/src/components/JsonTree';
import { useState } from 'react';

type FormatOptions = {
  indent: 2 | 4;
  sortKeys: boolean;
};

const MAX_SHAREABLE_INPUT_SIZE = 50 * 1024;
const SENSITIVE_KEY_PATTERN = /(secret|token|password|private|key)/i;

type UrlState = {
  input: string;
  options: FormatOptions;
};

function parseBooleanFlag(value: string | null): boolean {
  return value === '1' || value === 'true';
}

function decodeInitialState(): UrlState {
  const search = typeof globalThis.window === 'undefined' ? '' : globalThis.window.location.search;
  const params = new globalThis.URLSearchParams(search);
  const indent = params.get('indent') === '4' ? 4 : 2;
  const sortKeys = parseBooleanFlag(params.get('sort'));

  return {
    input: params.get('input') ?? '',
    options: {
      indent,
      sortKeys,
    },
  };
}

function encodeState(state: UrlState): string {
  const params = new globalThis.URLSearchParams();

  if (state.input.length > 0) {
    params.set('input', state.input);
  }

  params.set('indent', String(state.options.indent));
  if (state.options.sortKeys) {
    params.set('sort', '1');
  }

  return params.toString();
}

function hasSensitiveKeysDeep(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((entry) => hasSensitiveKeysDeep(entry));
  }

  if (!value || typeof value !== 'object') {
    return false;
  }

  for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      return true;
    }

    if (hasSensitiveKeysDeep(entryValue)) {
      return true;
    }
  }

  return false;
}

function shareSafetyReason(args: {
  input: string;
  parseOk: boolean;
  hasSensitiveKeys: boolean;
}): string | null {
  if (args.input.length >= MAX_SHAREABLE_INPUT_SIZE) {
    return 'Permalink disabled: input is larger than 50KB.';
  }

  if (!args.parseOk) {
    return 'Permalink disabled: JSON must be valid.';
  }

  if (args.hasSensitiveKeys) {
    return 'Permalink disabled: sensitive-looking keys were found.';
  }

  return null;
}

export default function ToolClient() {
  const [state, setState] = useState<UrlState>(() => decodeInitialState());
  const [selectedPath, setSelectedPath] = useState('$');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const parsed = parseJson(state.input);
  const validation = validateJson(state.input);
  const formatted = parsed.ok ? formatJson(parsed.value, state.options) : '';
  const sensitiveKeysFound = parsed.ok ? hasSensitiveKeysDeep(parsed.value) : false;
  const permalinkReason = shareSafetyReason({
    input: state.input,
    parseOk: parsed.ok,
    hasSensitiveKeys: sensitiveKeysFound,
  });
  const canShare = permalinkReason === null;

  const setNextState = (nextState: UrlState) => {
    setState(nextState);

    const query = encodeState(nextState);
    const nextUrl = query.length > 0 ? `${globalThis.window.location.pathname}?${query}` : globalThis.window.location.pathname;
    globalThis.window.history.replaceState(null, '', nextUrl);
  };

  const handleInputChange = (nextInput: string) => {
    setNextState({
      input: nextInput,
      options: state.options,
    });
  };

  const handleIndentChange = (nextIndent: 2 | 4) => {
    setNextState({
      input: state.input,
      options: {
        indent: nextIndent,
        sortKeys: state.options.sortKeys,
      },
    });
  };

  const handleSortKeysChange = (nextSortKeys: boolean) => {
    setNextState({
      input: state.input,
      options: {
        indent: state.options.indent,
        sortKeys: nextSortKeys,
      },
    });
  };

  const handleClear = () => {
    setSelectedPath('$');
    setStatusMessage(null);
    setNextState({
      input: '',
      options: {
        indent: 2,
        sortKeys: false,
      },
    });
  };

  const handleCopyFormatted = async () => {
    if (formatted.length === 0 || !globalThis.navigator?.clipboard) {
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(formatted);
      setStatusMessage('Formatted JSON copied.');
      notifyAction('copy', 'Formatted JSON copied to clipboard.');
    } catch {
      notifyActionError('Copy formatted JSON');
    }
  };

  const handleCopyPath = async () => {
    if (!selectedPath || !globalThis.navigator?.clipboard) {
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(selectedPath);
      setStatusMessage('Path copied.');
      notifyAction('copy', 'JSON path copied to clipboard.');
    } catch {
      notifyActionError('Copy path');
    }
  };

  const handleDownload = () => {
    if (formatted.length === 0) {
      return;
    }

    try {
      const blob = new globalThis.Blob([formatted], { type: 'application/json;charset=utf-8' });
      const url = globalThis.URL.createObjectURL(blob);
      const anchor = globalThis.document.createElement('a');
      anchor.href = url;
      anchor.download = 'formatted.json';
      anchor.click();
      globalThis.URL.revokeObjectURL(url);
      notifyAction('download', 'formatted.json is ready.');
    } catch {
      notifyActionError('Download');
    }
  };

  const handleSaveCard = async () => {
    if (formatted.length === 0) {
      return;
    }

    const inputTooLarge = state.input.length >= MAX_SHAREABLE_INPUT_SIZE;

    try {
      await saveToolCard({
        id: globalThis.crypto.randomUUID(),
        toolId: 'json-formatter',
        title: `JSON Formatter ${new Date().toISOString()}`,
        payload: {
          formattedOutput: formatted,
          options: state.options,
          inputTooLarge,
          ...(inputTooLarge ? {} : { rawInput: state.input }),
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
    const path = query.length > 0 ? `${globalThis.window.location.pathname}?${query}` : globalThis.window.location.pathname;
    const absolute = new globalThis.URL(path, globalThis.window.location.origin).toString();
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
      title="JSON Formatter"
      description="Validate, format, inspect, and save JSON safely."
      shareWarning={canShare ? undefined : permalinkReason ?? undefined}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleCopyPermalink} disabled={!canShare}>
            Copy Permalink
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyFormatted} disabled={formatted.length === 0}>
            Copy formatted JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={formatted.length === 0}>
            Download formatted.json
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveCard} disabled={formatted.length === 0}>
            Save card
          </Button>
          <Button variant="secondary" size="sm" onClick={handleClear}>
            Clear
          </Button>
        </>
      }
      left={
        <div className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="json-input">
            JSON input
          </label>
          <textarea
            id="json-input"
            className="h-[28rem] w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            value={state.input}
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder='{"name":"deepo"}'
            spellCheck={false}
          />
          <fieldset className="space-y-3 rounded-lg border border-border/70 p-3">
            <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Options</legend>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Indent</span>
              <Button
                type="button"
                variant={state.options.indent === 2 ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleIndentChange(2)}
              >
                2 spaces
              </Button>
              <Button
                type="button"
                variant={state.options.indent === 4 ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleIndentChange(4)}
              >
                4 spaces
              </Button>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.options.sortKeys}
                onChange={(event) => handleSortKeysChange(event.target.checked)}
              />
              Sort object keys deeply
            </label>
          </fieldset>
        </div>
      }
      right={
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold">Formatted output</h2>
            {validation.ok ? (
              <pre className="mt-2 max-h-60 overflow-auto rounded-md border border-border/70 bg-muted/30 p-3 font-mono text-xs">
                {formatted}
              </pre>
            ) : (
              <div className="mt-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {validation.errors.map((error) => (
                  <p key={`${error.line}:${error.column}:${error.message}`}>
                    {error.message} (line {error.line}, column {error.column})
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Tree viewer</h2>
              <Button variant="outline" size="sm" onClick={handleCopyPath}>
                Copy path
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Selected path: {selectedPath}</p>
            {parsed.ok ? (
              <JsonTree value={parsed.value} onSelectPath={setSelectedPath} />
            ) : (
              <p className="rounded-md border border-border/70 p-3 text-sm text-muted-foreground">
                Enter valid JSON to inspect the tree.
              </p>
            )}
          </div>

          {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
        </div>
      }
    />
  );
}

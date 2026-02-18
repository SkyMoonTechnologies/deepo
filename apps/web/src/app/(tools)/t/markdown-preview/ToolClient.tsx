'use client';

import { Button } from '@/components/ui/button';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { saveToolCard } from '@/lib/client-db';
import { formatMarkdown, renderMarkdownPreview } from '@deepo/tools-core';
import { ToolShell } from '@deepo/ui';
import { useState } from 'react';

type MarkdownState = {
  input: string;
  tab: 'preview' | 'formatted';
};

const MAX_SHAREABLE_INPUT = 40 * 1024;

function decodeState(): MarkdownState {
  if (typeof globalThis.window === 'undefined') {
    return { input: '', tab: 'preview' };
  }

  const params = new globalThis.URLSearchParams(globalThis.window.location.search);

  return {
    input: params.get('input') ?? '',
    tab: params.get('tab') === 'formatted' ? 'formatted' : 'preview',
  };
}

function encodeState(state: MarkdownState): string {
  const params = new globalThis.URLSearchParams();

  if (state.input) {
    params.set('input', state.input);
  }
  params.set('tab', state.tab);

  return params.toString();
}

export default function ToolClient() {
  const [state, setState] = useState<MarkdownState>(() => decodeState());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const formatted = formatMarkdown(state.input);
  const previewResult = renderMarkdownPreview(formatted);
  const canShare = state.input.length < MAX_SHAREABLE_INPUT;

  const setNextState = (nextState: MarkdownState) => {
    setState(nextState);

    const nextCanShare = nextState.input.length < MAX_SHAREABLE_INPUT;
    const query = nextCanShare ? encodeState(nextState) : '';
    const nextHref = query ? `${globalThis.window.location.pathname}?${query}` : globalThis.window.location.pathname;

    try {
      globalThis.window.history.replaceState(null, '', nextHref);
    } catch {
      globalThis.window.history.replaceState(null, '', globalThis.window.location.pathname);
    }
  };

  const handleCopy = async () => {
    if (!globalThis.navigator?.clipboard) {
      return;
    }

    const value = state.tab === 'formatted' ? formatted : previewResult.ok ? previewResult.value : '';

    if (!value) {
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(value);
      setStatusMessage(`${state.tab === 'formatted' ? 'Formatted markdown' : 'Preview HTML'} copied.`);
      notifyAction('copy', `${state.tab === 'formatted' ? 'Formatted markdown' : 'Preview HTML'} copied to clipboard.`);
    } catch {
      notifyActionError('Copy');
    }
  };

  const handleDownload = () => {
    const value = state.tab === 'formatted' ? formatted : previewResult.ok ? previewResult.value : '';
    if (!value) {
      return;
    }

    try {
      const extension = state.tab === 'formatted' ? 'md' : 'html';
      const blob = new globalThis.Blob([value], { type: 'text/plain;charset=utf-8' });
      const url = globalThis.URL.createObjectURL(blob);
      const anchor = globalThis.document.createElement('a');
      anchor.href = url;
      anchor.download = `markdown-output.${extension}`;
      anchor.click();
      globalThis.URL.revokeObjectURL(url);
      notifyAction('download', `markdown-output.${extension} is ready.`);
    } catch {
      notifyActionError('Download');
    }
  };

  const handleSaveCard = async () => {
    try {
      await saveToolCard({
        id: globalThis.crypto.randomUUID(),
        toolId: 'markdown-preview',
        title: `Markdown Preview ${new Date().toISOString()}`,
        payload: {
          formatted,
          html: previewResult.ok ? previewResult.value : null,
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
      title="Markdown Preview"
      description="Render markdown with GFM support and produce normalized output for sharing."
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
          <Button variant="secondary" size="sm" onClick={() => setNextState({ input: '', tab: 'preview' })}>
            Clear
          </Button>
        </>
      }
      left={
        <div className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="markdown-input">
            Markdown input
          </label>
          <textarea
            id="markdown-input"
            className="h-[30rem] w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            value={state.input}
            onChange={(event) => setNextState({ ...state, input: event.target.value })}
            placeholder="# Heading\n\n- item"
            spellCheck={false}
          />
        </div>
      }
      right={
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant={state.tab === 'preview' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setNextState({ ...state, tab: 'preview' })}
            >
              Rendered preview
            </Button>
            <Button
              variant={state.tab === 'formatted' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setNextState({ ...state, tab: 'formatted' })}
            >
              Formatted output
            </Button>
          </div>

          {state.tab === 'preview' ? (
            previewResult.ok ? (
              <div
                className="max-w-none rounded-md border border-border/70 p-3 text-sm leading-7 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-muted/40 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:text-lg [&_h4]:font-semibold [&_h5]:mb-2 [&_h5]:mt-4 [&_h5]:text-base [&_h5]:font-semibold [&_h6]:mb-2 [&_h6]:mt-3 [&_h6]:text-sm [&_h6]:font-semibold [&_h6]:text-muted-foreground [&_hr]:my-5 [&_hr]:border-border [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol_ol]:list-[lower-alpha] [&_ol_ol_ol]:list-[lower-roman] [&_p]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:border [&_pre]:border-border/70 [&_pre]:bg-muted/40 [&_pre]:p-3 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border/70 [&_td]:p-2 [&_th]:border [&_th]:border-border/70 [&_th]:bg-muted/40 [&_th]:p-2 [&_th]:text-left [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square]"
                dangerouslySetInnerHTML={{ __html: previewResult.value }}
              />
            ) : (
              <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {previewResult.error.message}
              </p>
            )
          ) : (
            <pre className="max-h-[30rem] overflow-auto whitespace-pre-wrap rounded-md border border-border/70 bg-muted/30 p-3 font-mono text-sm">
              {formatted}
            </pre>
          )}

          {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
        </div>
      }
    />
  );
}

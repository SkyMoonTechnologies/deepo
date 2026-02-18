'use client';

import { Button } from '@/components/ui/button';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import {
  applyReplace,
  compileRegex,
  findMatches,
  isRiskyRegex,
  type RegexMatch,
} from '@deepo/tools-core';
import { ToolShell } from '@deepo/ui';
import { useState, type ReactNode } from 'react';

type RegexState = {
  pattern: string;
  flags: string;
  text: string;
  replacement: string;
};

type SavedSnippet = {
  id: string;
  name: string;
  pattern: string;
  flags: string;
  replacement: string;
};

const MAX_SHAREABLE_TEXT = 30 * 1024;
const SNIPPETS_STORAGE_KEY = 'deepo:regex-snippets';

function readSnippets(): SavedSnippet[] {
  if (!globalThis.window) {
    return [];
  }

  const raw = globalThis.window.localStorage.getItem(SNIPPETS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is SavedSnippet => {
      return (
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.pattern === 'string' &&
        typeof item.flags === 'string' &&
        typeof item.replacement === 'string'
      );
    });
  } catch {
    return [];
  }
}

function encodeState(state: RegexState): string {
  const params = new globalThis.URLSearchParams();

  if (state.pattern) {
    params.set('pattern', state.pattern);
  }
  if (state.flags) {
    params.set('flags', state.flags);
  }
  if (state.text) {
    params.set('text', state.text);
  }
  if (state.replacement) {
    params.set('replacement', state.replacement);
  }

  return params.toString();
}

function decodeState(): RegexState {
  const params = new globalThis.URLSearchParams(globalThis.window.location.search);

  return {
    pattern: params.get('pattern') ?? '',
    flags: params.get('flags') ?? 'g',
    text: params.get('text') ?? '',
    replacement: params.get('replacement') ?? '',
  };
}

function renderHighlighted(text: string, matches: RegexMatch[]) {
  if (matches.length === 0) {
    return <span>{text}</span>;
  }

  const nodes: ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    const start = match.index;
    const end = start + match.match.length;

    if (start > cursor) {
      nodes.push(<span key={`plain-${index}-${cursor}`}>{text.slice(cursor, start)}</span>);
    }

    nodes.push(
      <mark key={`match-${index}-${start}`} className="rounded bg-amber-300/80 px-0.5 text-amber-950">
        {text.slice(start, end)}
      </mark>,
    );

    cursor = end;
  });

  if (cursor < text.length) {
    nodes.push(<span key={`plain-end-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return nodes;
}

export default function ToolClient() {
  const [state, setState] = useState<RegexState>(() => decodeState());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<SavedSnippet[]>(() => readSnippets());

  const compiled = compileRegex(state.pattern, state.flags);
  const matches = compiled.ok ? findMatches(compiled.value, state.text) : [];
  const replacePreview = compiled.ok ? applyReplace(compiled.value, state.text, state.replacement) : null;
  const risky = state.pattern.length > 0 ? isRiskyRegex(state.pattern) : false;
  const canShare = state.text.length < MAX_SHAREABLE_TEXT;
  const shareWarning = !canShare
    ? 'Permalink disabled: test text exceeds 30KB.'
    : risky
      ? 'Warning: this pattern appears potentially unsafe (catastrophic backtracking risk).'
      : undefined;

  const setNextState = (nextState: RegexState) => {
    setState(nextState);

    const query = canShare ? encodeState(nextState) : '';
    const nextHref = query ? `${globalThis.window.location.pathname}?${query}` : globalThis.window.location.pathname;
    globalThis.window.history.replaceState(null, '', nextHref);
  };

  const handleSaveSnippet = () => {
    if (!state.pattern.trim()) {
      return;
    }

    const snippet: SavedSnippet = {
      id: globalThis.crypto.randomUUID(),
      name: `Snippet ${new Date().toISOString()}`,
      pattern: state.pattern,
      flags: state.flags,
      replacement: state.replacement,
    };

    const nextSnippets = [snippet, ...snippets].slice(0, 25);
    setSnippets(nextSnippets);
    globalThis.window.localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(nextSnippets));
    setStatusMessage('Snippet saved locally.');
    notifyAction('save', 'Snippet saved locally.');
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

  const handleClear = () => {
    setStatusMessage(null);
    setNextState({ pattern: '', flags: 'g', text: '', replacement: '' });
  };

  return (
    <ToolShell
      title="Regex Tester"
      description="Compile patterns, inspect match groups, preview replacements, and keep reusable snippets."
      shareWarning={shareWarning}
      actions={
        <>
          <Button variant="outline" size="sm" disabled={!canShare} onClick={handleCopyPermalink}>
            Copy Permalink
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveSnippet}>
            Save snippet
          </Button>
          <Button variant="secondary" size="sm" onClick={handleClear}>
            Clear
          </Button>
        </>
      }
      left={
        <div className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="regex-pattern">
            Pattern
          </label>
          <input
            id="regex-pattern"
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            value={state.pattern}
            onChange={(event) => setNextState({ ...state, pattern: event.target.value })}
            placeholder="(\\w+)-(\\d+)"
          />

          <label className="block text-sm font-medium" htmlFor="regex-flags">
            Flags
          </label>
          <input
            id="regex-flags"
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            value={state.flags}
            onChange={(event) => setNextState({ ...state, flags: event.target.value })}
            placeholder="gim"
          />

          <label className="block text-sm font-medium" htmlFor="regex-text">
            Test text
          </label>
          <textarea
            id="regex-text"
            className="h-56 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            value={state.text}
            onChange={(event) => setNextState({ ...state, text: event.target.value })}
            spellCheck={false}
          />

          <label className="block text-sm font-medium" htmlFor="regex-replacement">
            Replacement preview
          </label>
          <input
            id="regex-replacement"
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            value={state.replacement}
            onChange={(event) => setNextState({ ...state, replacement: event.target.value })}
            placeholder="$1"
          />

          {snippets.length > 0 ? (
            <div className="space-y-2 rounded-md border border-border/70 p-3">
              <h2 className="text-sm font-semibold">Saved snippets</h2>
              <ul className="space-y-1 text-sm">
                {snippets.map((snippet) => (
                  <li key={snippet.id}>
                    <button
                      type="button"
                      className="w-full rounded border border-border/70 px-2 py-1 text-left font-mono hover:bg-muted/50"
                      onClick={() =>
                        setNextState({
                          ...state,
                          pattern: snippet.pattern,
                          flags: snippet.flags,
                          replacement: snippet.replacement,
                        })
                      }
                    >
                      {snippet.pattern} /{snippet.flags}/
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      }
      right={
        <div className="space-y-4">
          {!compiled.ok ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {compiled.error.message}
            </p>
          ) : (
            <>
              <div>
                <h2 className="text-sm font-semibold">Match highlights</h2>
                <pre className="mt-2 min-h-20 whitespace-pre-wrap rounded-md border border-border/70 bg-muted/30 p-3 font-mono text-sm">
                  {renderHighlighted(state.text, matches)}
                </pre>
              </div>

              <div>
                <h2 className="text-sm font-semibold">Matches ({matches.length})</h2>
                <ul className="mt-2 max-h-48 space-y-2 overflow-auto rounded-md border border-border/70 p-2 text-xs">
                  {matches.map((match, index) => (
                    <li key={`${match.index}-${index}`} className="rounded border border-border/60 p-2">
                      <p className="font-mono">#{index + 1} at {match.index}: {JSON.stringify(match.match)}</p>
                      <p className="font-mono text-muted-foreground">Groups: {JSON.stringify(match.groups)}</p>
                      <p className="font-mono text-muted-foreground">Named: {JSON.stringify(match.namedGroups)}</p>
                    </li>
                  ))}
                  {matches.length === 0 ? <li className="text-muted-foreground">No matches.</li> : null}
                </ul>
              </div>

              <div>
                <h2 className="text-sm font-semibold">Replace preview</h2>
                <pre className="mt-2 whitespace-pre-wrap rounded-md border border-border/70 bg-muted/30 p-3 font-mono text-sm">
                  {replacePreview?.ok ? replacePreview.value : ''}
                </pre>
              </div>
            </>
          )}

          {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
        </div>
      }
    />
  );
}

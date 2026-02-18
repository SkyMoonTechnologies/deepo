'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { diffJsonSemantic, parseJsonPair } from '@deepo/tools-core';

import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';

const MAX_SHARE_BYTES = 50 * 1024;

type ToolClientProps = {
  panel: ToolPanel;
};

const byteLength = (value: string) => new globalThis.TextEncoder().encode(value).length;

const readState = (params: globalThis.URLSearchParams) => ({
  left: params.get('left') ?? '{\n  "name": "before"\n}',
  right: params.get('right') ?? '{\n  "name": "after"\n}',
  arraysOrderInsensitive: params.get('oi') === '1',
});

export default function ToolClient({ panel }: ToolClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readState(new globalThis.URLSearchParams(searchParams.toString()));

  const setParam = (key: string, value: string | boolean) => {
    const next = new globalThis.URLSearchParams(searchParams.toString());

    if (typeof value === 'boolean') {
      if (value) {
        next.set(key, '1');
      } else {
        next.delete(key);
      }
    } else if (value.length > 0) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    const query = next.toString();
    router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const shareSafe = byteLength(state.left) <= MAX_SHARE_BYTES && byteLength(state.right) <= MAX_SHARE_BYTES;

  if (panel === 'input') {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">JSON inputs</h2>
        <label className="block space-y-1 text-sm">
          <span>Left JSON</span>
          <textarea
            className="h-52 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            spellCheck={false}
            value={state.left}
            onChange={(event) => setParam('left', event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Right JSON</span>
          <textarea
            className="h-52 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            spellCheck={false}
            value={state.right}
            onChange={(event) => setParam('right', event.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.arraysOrderInsensitive}
            onChange={(event) => setParam('oi', event.target.checked)}
          />
          Array order-insensitive (primitive arrays)
        </label>
        {!shareSafe ? <p className="text-xs text-amber-700">URL sharing is limited to 50KB per side.</p> : null}
      </div>
    );
  }

  let parseError: string | null = null;
  let result = { added: [] as string[], removed: [] as string[], changed: [] as Array<{ path: string; before: unknown; after: unknown }> };

  try {
    const parsed = parseJsonPair(state.left, state.right);
    result = diffJsonSemantic(parsed.left, parsed.right, { arraysOrderInsensitive: state.arraysOrderInsensitive });
  } catch {
    parseError = 'Both inputs must be valid JSON.';
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Diff result</h2>
      {parseError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{parseError}</p>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-emerald-300/70 bg-emerald-50 p-3">
              <p className="text-xs uppercase tracking-wide text-emerald-800">Added paths</p>
              <p className="mt-1 text-xl font-semibold text-emerald-900">{result.added.length}</p>
            </div>
            <div className="rounded-md border border-rose-300/70 bg-rose-50 p-3">
              <p className="text-xs uppercase tracking-wide text-rose-800">Removed paths</p>
              <p className="mt-1 text-xl font-semibold text-rose-900">{result.removed.length}</p>
            </div>
            <div className="rounded-md border border-amber-300/70 bg-amber-50 p-3">
              <p className="text-xs uppercase tracking-wide text-amber-800">Changed paths</p>
              <p className="mt-1 text-xl font-semibold text-amber-900">{result.changed.length}</p>
            </div>
          </div>

          <details className="rounded-md border border-border/70 p-3" open>
            <summary className="cursor-pointer text-sm font-medium">Added</summary>
            <ul className="mt-2 space-y-1 text-xs font-mono">
              {result.added.length > 0 ? result.added.map((path) => <li key={path}>{path}</li>) : <li>None</li>}
            </ul>
          </details>

          <details className="rounded-md border border-border/70 p-3" open>
            <summary className="cursor-pointer text-sm font-medium">Removed</summary>
            <ul className="mt-2 space-y-1 text-xs font-mono">
              {result.removed.length > 0 ? result.removed.map((path) => <li key={path}>{path}</li>) : <li>None</li>}
            </ul>
          </details>

          <details className="rounded-md border border-border/70 p-3" open>
            <summary className="cursor-pointer text-sm font-medium">Changed details</summary>
            <ul className="mt-2 space-y-2 text-xs">
              {result.changed.length > 0 ? (
                result.changed.map((change) => (
                  <li key={change.path} className="rounded bg-muted/50 p-2">
                    <p className="font-mono font-medium">{change.path}</p>
                    <p className="font-mono text-muted-foreground">before: {JSON.stringify(change.before)}</p>
                    <p className="font-mono text-muted-foreground">after: {JSON.stringify(change.after)}</p>
                  </li>
                ))
              ) : (
                <li>None</li>
              )}
            </ul>
          </details>
        </>
      )}
    </div>
  );
}

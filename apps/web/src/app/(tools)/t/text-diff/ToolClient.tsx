'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { diffText } from '@deepo/tools-core';

import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';

const MAX_SHARE_TEXT_BYTES = 30 * 1024;

type ToolClientProps = {
  panel: ToolPanel;
};

const readState = (params: globalThis.URLSearchParams) => ({
  left: params.get('left') ?? '',
  right: params.get('right') ?? '',
  ignoreWhitespace: params.get('iw') === '1',
  wordDiff: params.get('wd') === '1',
});

const safeByteLength = (value: string) => new globalThis.TextEncoder().encode(value).length;

export default function ToolClient({ panel }: ToolClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new globalThis.URLSearchParams(searchParams.toString());
  const state = readState(params);

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

  if (panel === 'input') {
    const leftTooLarge = safeByteLength(state.left) > MAX_SHARE_TEXT_BYTES;
    const rightTooLarge = safeByteLength(state.right) > MAX_SHARE_TEXT_BYTES;

    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Inputs</h2>
        <label className="block space-y-1 text-sm">
          <span>Original text</span>
          <textarea
            className="h-48 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            spellCheck={false}
            value={state.left}
            onChange={(event) => setParam('left', event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Updated text</span>
          <textarea
            className="h-48 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            spellCheck={false}
            value={state.right}
            onChange={(event) => setParam('right', event.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.ignoreWhitespace}
            onChange={(event) => setParam('iw', event.target.checked)}
          />
          Ignore whitespace changes
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={state.wordDiff} onChange={(event) => setParam('wd', event.target.checked)} />
          Highlight word changes
        </label>
        {leftTooLarge || rightTooLarge ? (
          <p className="text-xs text-amber-700">URL sharing is only safe when each side is under 30KB.</p>
        ) : null}
      </div>
    );
  }

  const result = diffText(state.left, state.right, {
    ignoreWhitespace: state.ignoreWhitespace,
    wordDiff: state.wordDiff,
  });

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Side-by-side diff</h2>
      <div className="max-h-[34rem] overflow-auto rounded-md border border-border/70">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-muted/80">
            <tr>
              <th className="w-12 border-b border-border/70 p-2 text-left">L#</th>
              <th className="border-b border-border/70 p-2 text-left">Original</th>
              <th className="w-12 border-b border-border/70 p-2 text-left">R#</th>
              <th className="border-b border-border/70 p-2 text-left">Updated</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, index) => {
              const rowClass =
                row.kind === 'added'
                  ? 'bg-emerald-100/50'
                  : row.kind === 'removed'
                    ? 'bg-rose-100/55'
                    : row.kind === 'changed'
                      ? 'bg-amber-100/55'
                      : '';

              return (
                <tr key={`${row.leftLine ?? 'n'}-${row.rightLine ?? 'n'}-${index}`} className={rowClass}>
                  <td className="border-b border-border/60 p-2 align-top text-muted-foreground">{row.leftLine ?? ''}</td>
                  <td className="border-b border-border/60 p-2 align-top font-mono">
                    {row.leftWords ? (
                      <span>
                        {row.leftWords.map((part, partIndex) => (
                          <span
                            key={`${index}-l-${partIndex}-${part.value}`}
                            className={part.kind === 'removed' ? 'bg-rose-200' : undefined}
                          >
                            {part.value}
                          </span>
                        ))}
                      </span>
                    ) : (
                      row.leftText
                    )}
                  </td>
                  <td className="border-b border-border/60 p-2 align-top text-muted-foreground">{row.rightLine ?? ''}</td>
                  <td className="border-b border-border/60 p-2 align-top font-mono">
                    {row.rightWords ? (
                      <span>
                        {row.rightWords.map((part, partIndex) => (
                          <span
                            key={`${index}-r-${partIndex}-${part.value}`}
                            className={part.kind === 'added' ? 'bg-emerald-200' : undefined}
                          >
                            {part.value}
                          </span>
                        ))}
                      </span>
                    ) : (
                      row.rightText
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

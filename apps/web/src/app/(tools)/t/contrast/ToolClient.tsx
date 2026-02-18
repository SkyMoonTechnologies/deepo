'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { evaluateContrast, suggestNearestCompliantColors } from '@deepo/tools-core';

import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';

type ToolClientProps = {
  panel: ToolPanel;
};

const readState = (params: globalThis.URLSearchParams) => ({
  fg: params.get('fg') ?? '#111111',
  bg: params.get('bg') ?? '#ffffff',
});

export default function ToolClient({ panel }: ToolClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readState(new globalThis.URLSearchParams(searchParams.toString()));

  const setParam = (key: string, value: string) => {
    const next = new globalThis.URLSearchParams(searchParams.toString());

    if (value.length > 0) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    const query = next.toString();
    router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  if (panel === 'input') {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Colors</h2>
        <label className="block space-y-1 text-sm">
          <span>Foreground</span>
          <input
            className="w-full rounded-md border border-input bg-background p-2 font-mono text-sm"
            value={state.fg}
            onChange={(event) => setParam('fg', event.target.value)}
            placeholder="#111111"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Background</span>
          <input
            className="w-full rounded-md border border-input bg-background p-2 font-mono text-sm"
            value={state.bg}
            onChange={(event) => setParam('bg', event.target.value)}
            placeholder="#ffffff"
          />
        </label>
        <div
          className="rounded-md border border-border/70 p-4"
          style={{ color: state.fg, background: state.bg }}
        >
          Sample text for contrast preview.
        </div>
      </div>
    );
  }

  const report = evaluateContrast(state.fg, state.bg);
  const suggestions = report ? suggestNearestCompliantColors(state.fg, state.bg) : [];

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">WCAG result</h2>
      {!report ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          Enter valid color values (HEX, rgb(), or hsl()).
        </p>
      ) : (
        <>
          <p className="text-sm">
            Contrast ratio: <span className="font-semibold">{report.ratio}:1</span>
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span
              className={`rounded border px-2 py-1 font-medium ${report.wcag.normalAA ? 'border-emerald-300 bg-emerald-100 !text-emerald-950' : 'border-rose-300 bg-rose-100 !text-rose-950'}`}
            >
              AA normal {report.wcag.normalAA ? '(pass)' : '(fail)'}
            </span>
            <span
              className={`rounded border px-2 py-1 font-medium ${report.wcag.normalAAA ? 'border-emerald-300 bg-emerald-100 !text-emerald-950' : 'border-rose-300 bg-rose-100 !text-rose-950'}`}
            >
              AAA normal {report.wcag.normalAAA ? '(pass)' : '(fail)'}
            </span>
            <span
              className={`rounded border px-2 py-1 font-medium ${report.wcag.largeAA ? 'border-emerald-300 bg-emerald-100 !text-emerald-950' : 'border-rose-300 bg-rose-100 !text-rose-950'}`}
            >
              AA large {report.wcag.largeAA ? '(pass)' : '(fail)'}
            </span>
            <span
              className={`rounded border px-2 py-1 font-medium ${report.wcag.largeAAA ? 'border-emerald-300 bg-emerald-100 !text-emerald-950' : 'border-rose-300 bg-rose-100 !text-rose-950'}`}
            >
              AAA large {report.wcag.largeAAA ? '(pass)' : '(fail)'}
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Nearest compliant suggestions</h3>
            {suggestions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Current foreground already meets key thresholds.
              </p>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((suggestion) => (
                  <li
                    key={`${suggestion.label}-${suggestion.color}`}
                    className="rounded-md border border-border/70 p-2 text-xs"
                  >
                    <p className="font-medium">{suggestion.label}</p>
                    <p className="font-mono">
                      {suggestion.color} ({suggestion.ratio}:1)
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

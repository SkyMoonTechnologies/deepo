'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { buildHarmonyPalette, convertColor, type HarmonyMode } from '@deepo/tools-core';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';

import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';

type ToolClientProps = {
  panel: ToolPanel;
};

const readState = (params: globalThis.URLSearchParams): { color: string; mode: HarmonyMode } => {
  const mode = params.get('mode');

  return {
    color: params.get('color') ?? '#3366ff',
    mode: mode === 'analogous' || mode === 'complementary' || mode === 'triad' ? mode : 'analogous',
  };
};

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

  const copySwatch = async (swatch: string) => {
    if (!globalThis.navigator?.clipboard) {
      notifyActionError('Copy');
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(swatch);
      notifyAction('copy', 'Swatch value copied to clipboard.');
    } catch {
      notifyActionError('Copy');
    }
  };

  if (panel === 'input') {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Color input</h2>
        <label className="block space-y-1 text-sm">
          <span>Color value</span>
          <input
            className="w-full rounded-md border border-input bg-background p-2 font-mono text-sm"
            value={state.color}
            onChange={(event) => setParam('color', event.target.value)}
            placeholder="#3366ff"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Harmony</span>
          <select
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
            value={state.mode}
            onChange={(event) => setParam('mode', event.target.value)}
          >
            <option value="analogous">Analogous</option>
            <option value="complementary">Complementary</option>
            <option value="triad">Triad</option>
          </select>
        </label>
      </div>
    );
  }

  const converted = convertColor(state.color);
  const palette = buildHarmonyPalette(state.color, state.mode);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Converted formats</h2>
      {!converted ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          Enter a valid color (HEX, rgb(), hsl(), or oklch()).
        </p>
      ) : (
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">HEX:</span> <span className="font-mono">{converted.hex}</span></p>
          <p><span className="font-medium">RGB:</span> <span className="font-mono">{converted.rgb}</span></p>
          <p><span className="font-medium">HSL:</span> <span className="font-mono">{converted.hsl}</span></p>
          <p><span className="font-medium">OKLCH:</span> <span className="font-mono">{converted.oklch}</span></p>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Palette suggestions</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {palette.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => void copySwatch(swatch)}
              className="flex items-center gap-3 rounded-md border border-border/70 p-2 text-left"
            >
              <span className="h-8 w-8 rounded border border-border/60" style={{ background: swatch }} />
              <span className="font-mono text-xs">{swatch}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

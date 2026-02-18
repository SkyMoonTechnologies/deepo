'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { generateClamp, generateTypeScale, typographyScalePresets, type TypographyScalePreset } from '@deepo/tools-core';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';

import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';

type ToolClientProps = {
  panel: ToolPanel;
};

const readNumber = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readState = (params: globalThis.URLSearchParams) => {
  const preset = params.get('preset');
  const validPreset: TypographyScalePreset =
    preset && preset in typographyScalePresets ? (preset as TypographyScalePreset) : 'majorThird';

  return {
    preset: validPreset,
    base: readNumber(params.get('base'), 16),
    steps: readNumber(params.get('steps'), 6),
    minSize: readNumber(params.get('min'), 16),
    maxSize: readNumber(params.get('max'), 28),
    minViewport: readNumber(params.get('minvw'), 320),
    maxViewport: readNumber(params.get('maxvw'), 1280),
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

  const copyCssBlock = async (value: string) => {
    if (!globalThis.navigator?.clipboard) {
      notifyActionError('Copy');
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(value);
      notifyAction('copy', 'CSS block copied to clipboard.');
    } catch {
      notifyActionError('Copy');
    }
  };

  if (panel === 'input') {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Scale controls</h2>
        <label className="block space-y-1 text-sm">
          <span>Preset ratio</span>
          <select
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
            value={state.preset}
            onChange={(event) => setParam('preset', event.target.value)}
          >
            {Object.keys(typographyScalePresets).map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span>Base font size (px)</span>
          <input
            type="number"
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
            value={state.base}
            onChange={(event) => setParam('base', event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Scale steps</span>
          <input
            type="number"
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
            value={state.steps}
            onChange={(event) => setParam('steps', event.target.value)}
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span>Min size (px)</span>
            <input
              type="number"
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={state.minSize}
              onChange={(event) => setParam('min', event.target.value)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Max size (px)</span>
            <input
              type="number"
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={state.maxSize}
              onChange={(event) => setParam('max', event.target.value)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Min viewport (px)</span>
            <input
              type="number"
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={state.minViewport}
              onChange={(event) => setParam('minvw', event.target.value)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Max viewport (px)</span>
            <input
              type="number"
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={state.maxViewport}
              onChange={(event) => setParam('maxvw', event.target.value)}
            />
          </label>
        </div>
      </div>
    );
  }

  const ratio = typographyScalePresets[state.preset];
  const scale = generateTypeScale(state.base, ratio, Math.max(1, Math.trunc(state.steps)));
  const clamp = generateClamp({
    minSizePx: state.minSize,
    maxSizePx: state.maxSize,
    minViewportPx: state.minViewport,
    maxViewportPx: state.maxViewport,
  });
  const cssBlock = `:root {\n  --type-clamp: ${clamp};\n}`;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Typography output</h2>
      <div className="rounded-md border border-border/70 p-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Scale ({state.preset})</p>
        <ul className="mt-2 space-y-1 text-sm">
          {scale.map((size, index) => (
            <li key={`${size}-${index}`}>Step {index}: {size}px</li>
          ))}
        </ul>
      </div>
      <div className="space-y-2 rounded-md border border-border/70 p-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Clamp CSS</p>
        <pre className="overflow-auto rounded bg-muted/50 p-2 text-xs">{cssBlock}</pre>
        <button
          type="button"
          className="rounded border border-input px-2 py-1 text-xs"
          onClick={() => void copyCssBlock(cssBlock)}
        >
          Copy CSS block
        </button>
      </div>
    </div>
  );
}

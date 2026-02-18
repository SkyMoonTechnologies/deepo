'use client';

import { isFormatSupported, optimizeImageFile, type ImageOutputFormat, type OptimizeImageResult } from '@deepo/tools-core';

import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { useToolRuntimeState } from '@/lib/tool-runtime-state';

type ToolClientProps = {
  panel: ToolPanel;
};

type ImageToolState = {
  file: globalThis.File | null;
  originalUrl: string | null;
  optimized: OptimizeImageResult | null;
  optimizedUrl: string | null;
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: ImageOutputFormat;
  error: string | null;
};

const initialState: ImageToolState = {
  file: null,
  originalUrl: null,
  optimized: null,
  optimizedUrl: null,
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  format: 'image/webp',
  error: null,
};

const ALL_FORMATS: ImageOutputFormat[] = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];
const SUPPORTED_FORMATS: ImageOutputFormat[] = ALL_FORMATS.filter((format): format is ImageOutputFormat =>
  isFormatSupported(format),
);

const formatLabel = (format: ImageOutputFormat) => format.replace('image/', '').toUpperCase();

const bytesLabel = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

export default function ToolClient({ panel }: ToolClientProps) {
  const [state, setState] = useToolRuntimeState<ImageToolState>('image-optimize', initialState);

  if (panel === 'input') {
    const onFileChange = (file: globalThis.File | null) => {
      if (!file) {
        setState({ ...state, file: null, originalUrl: null, optimized: null, optimizedUrl: null, error: null });
        return;
      }

      const originalUrl = globalThis.URL.createObjectURL(file);
      setState({ ...state, file, originalUrl, optimized: null, optimizedUrl: null, error: null });
    };

    const runOptimize = async () => {
      if (!state.file) {
        return;
      }

      try {
        const optimized = await optimizeImageFile(state.file, {
          maxWidth: state.maxWidth,
          maxHeight: state.maxHeight,
          quality: state.quality,
          format: state.format,
        });

        const optimizedUrl = globalThis.URL.createObjectURL(optimized.blob);
        setState({ ...state, optimized, optimizedUrl, error: null });
      } catch (error) {
        setState({ ...state, error: error instanceof Error ? error.message : 'Image optimization failed.' });
      }
    };

    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Upload and settings</h2>
        <label className="block space-y-1 text-sm">
          <span>Image file</span>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Max width</span>
            <input
              type="number"
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={state.maxWidth}
              onChange={(event) => setState({ ...state, maxWidth: Number(event.target.value) || 1 })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Max height</span>
            <input
              type="number"
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={state.maxHeight}
              onChange={(event) => setState({ ...state, maxHeight: Number(event.target.value) || 1 })}
            />
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <span>Quality ({Math.round(state.quality * 100)}%)</span>
          <input
            type="range"
            min={0.4}
            max={1}
            step={0.05}
            value={state.quality}
            onChange={(event) => setState({ ...state, quality: Number(event.target.value) })}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Output format</span>
          <select
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
            value={state.format}
            onChange={(event) => setState({ ...state, format: event.target.value as ImageOutputFormat })}
          >
            {SUPPORTED_FORMATS.map((format) => (
              <option key={format} value={format}>
                {formatLabel(format)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="rounded-md border border-input px-3 py-2 text-sm"
          disabled={!state.file}
          onClick={() => void runOptimize()}
        >
          Optimize image
        </button>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Preview and download</h2>
      {state.originalUrl ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Before</p>
            <img src={state.originalUrl} alt="Original upload" className="mt-2 max-h-44 rounded border border-border/70 object-contain" />
            {state.file ? <p className="mt-1 text-xs text-muted-foreground">{bytesLabel(state.file.size)}</p> : null}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">After</p>
            {state.optimizedUrl ? (
              <>
                <img src={state.optimizedUrl} alt="Optimized output" className="mt-2 max-h-44 rounded border border-border/70 object-contain" />
                {state.optimized ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {state.optimized.width}x{state.optimized.height} • {bytesLabel(state.optimized.optimizedBytes)}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="mt-2 rounded-md border border-input px-3 py-1 text-sm"
                  onClick={() => {
                    if (!state.optimizedUrl) {
                      return;
                    }

                    try {
                      const filename = `optimized.${formatLabel(state.format).toLowerCase()}`;
                      const anchor = globalThis.document.createElement('a');
                      anchor.href = state.optimizedUrl;
                      anchor.download = filename;
                      anchor.click();
                      notifyAction('download', `${filename} is ready.`);
                    } catch {
                      notifyActionError('Download');
                    }
                  }}
                >
                  Download output
                </button>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Run optimization to see output.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Upload an image to begin.</p>
      )}
      <p className="text-xs text-muted-foreground">URL state is disabled for this tool because files cannot be serialized.</p>
    </div>
  );
}

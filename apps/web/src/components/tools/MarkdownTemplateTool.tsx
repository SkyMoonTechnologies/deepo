'use client';

import { saveToolCard } from '@/lib/client-db';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';

import type { ToolPanel } from './ToolPlaceholderClient';

export type TemplateField = {
  key: string;
  label: string;
  multiline?: boolean;
  placeholder?: string;
};

type MarkdownTemplateToolProps = {
  panel: ToolPanel;
  toolId: string;
  title: string;
  fields: TemplateField[];
  initialState: Record<string, string>;
  maxShareBytes?: number;
  generate: (state: Record<string, string>) => string;
  inputFooter?: (state: Record<string, string>, setField: (key: string, value: string) => void) => ReactNode;
};

export default function MarkdownTemplateTool({
  panel,
  toolId,
  title,
  fields,
  initialState,
  maxShareBytes = 40 * 1024,
  generate,
  inputFooter,
}: MarkdownTemplateToolProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: Record<string, string> = { ...initialState };

  for (const field of fields) {
    state[field.key] = searchParams.get(field.key) ?? initialState[field.key] ?? '';
  }

  const setField = (key: string, value: string) => {
    const next = new globalThis.URLSearchParams(searchParams.toString());

    if (value.length > 0) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    const query = next.toString();
    router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const markdown = generate(state);
  const shareSafe = new globalThis.TextEncoder().encode(searchParams.toString()).length <= maxShareBytes;

  const downloadMarkdown = () => {
    try {
      const blob = new globalThis.Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = globalThis.URL.createObjectURL(blob);
      const anchor = globalThis.document.createElement('a');
      anchor.href = url;
      anchor.download = `${toolId}.md`;
      anchor.click();
      globalThis.URL.revokeObjectURL(url);
      notifyAction('download', `${toolId}.md is ready.`);
    } catch {
      notifyActionError('Download');
    }
  };

  const saveCard = async () => {
    try {
      await saveToolCard({
        id: globalThis.crypto.randomUUID(),
        toolId,
        title: `${title} ${new Date().toISOString()}`,
        payload: {
          state,
          markdown,
        },
      });

      notifyAction('save', 'Card saved locally.');
    } catch {
      notifyActionError('Save card');
    }
  };

  if (panel === 'input') {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Form</h2>
        {fields.map((field) => (
          <label key={field.key} className="block space-y-1 text-sm">
            <span>{field.label}</span>
            {field.multiline ? (
              <textarea
                className="h-24 w-full rounded-md border border-input bg-background p-2 text-sm"
                value={state[field.key]}
                onChange={(event) => setField(field.key, event.target.value)}
                placeholder={field.placeholder}
              />
            ) : (
              <input
                className="w-full rounded-md border border-input bg-background p-2 text-sm"
                value={state[field.key]}
                onChange={(event) => setField(field.key, event.target.value)}
                placeholder={field.placeholder}
              />
            )}
          </label>
        ))}
        {inputFooter ? inputFooter(state, setField) : null}
        {!shareSafe ? <p className="text-xs text-amber-700">URL state is share-safe only below 40KB.</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Markdown output</h2>
      <pre className="max-h-[34rem] overflow-auto rounded-md border border-border/70 bg-muted/40 p-3 text-xs">{markdown}</pre>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-input px-2 py-1 text-xs"
          onClick={() => {
            if (!globalThis.navigator?.clipboard) {
              notifyActionError('Copy');
              return;
            }

            void globalThis.navigator.clipboard
              .writeText(markdown)
              .then(() => notifyAction('copy', 'Markdown copied to clipboard.'))
              .catch(() => notifyActionError('Copy'));
          }}
        >
          Copy
        </button>
        <button type="button" className="rounded border border-input px-2 py-1 text-xs" onClick={downloadMarkdown}>
          Download
        </button>
        <button type="button" className="rounded border border-input px-2 py-1 text-xs" onClick={() => void saveCard()}>
          Save
        </button>
      </div>
    </div>
  );
}

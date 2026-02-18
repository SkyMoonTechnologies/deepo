'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { buildUtmVariants, validateBaseUrl, validateUtmParams } from '@deepo/tools-core';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';

import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';

type ToolClientProps = {
  panel: ToolPanel;
};

const readState = (params: globalThis.URLSearchParams) => ({
  base: params.get('base') ?? 'https://example.com/landing',
  source: params.get('source') ?? 'newsletter',
  medium: params.get('medium') ?? 'email',
  campaign: params.get('campaign') ?? 'launch',
  term: params.get('term') ?? '',
  content: params.get('content') ?? '',
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

  const baseValidation = validateBaseUrl(state.base);
  const paramsValidation = validateUtmParams({
    source: state.source,
    medium: state.medium,
    campaign: state.campaign,
    term: state.term,
    content: state.content,
  });
  const valid = baseValidation.ok && paramsValidation.ok;
  const validationError = !baseValidation.ok
    ? baseValidation.error
    : !paramsValidation.ok
      ? paramsValidation.error
      : null;

  const copyToClipboard = async (value: string, label: string) => {
    if (!globalThis.navigator?.clipboard) {
      notifyActionError('Copy');
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(value);
      notifyAction('copy', `${label} copied to clipboard.`);
    } catch {
      notifyActionError('Copy');
    }
  };

  if (panel === 'input') {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Campaign fields</h2>
        {[
          ['base', 'Base URL', state.base],
          ['source', 'utm_source', state.source],
          ['medium', 'utm_medium', state.medium],
          ['campaign', 'utm_campaign', state.campaign],
          ['term', 'utm_term', state.term],
          ['content', 'utm_content', state.content],
        ].map(([key, label, value]) => (
          <label key={key} className="block space-y-1 text-sm">
            <span>{label}</span>
            <input
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={value}
              onChange={(event) => setParam(key, event.target.value)}
            />
          </label>
        ))}
        {!valid ? <p className="text-xs text-destructive">{validationError}</p> : null}
      </div>
    );
  }

  const variants = valid
    ? buildUtmVariants(state.base, {
        source: state.source,
        medium: state.medium,
        campaign: state.campaign,
        term: state.term,
        content: state.content,
      })
    : null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Preview URLs</h2>
      {!variants ? (
        <p className="text-sm text-muted-foreground">Provide a valid URL and required UTM parameters.</p>
      ) : (
        <>
          <div className="rounded-md border border-border/70 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Full URL</p>
            <p className="mt-1 break-all font-mono text-xs">{variants.full}</p>
            <button
              type="button"
              className="mt-2 rounded border border-input px-2 py-1 text-xs"
              onClick={() => void copyToClipboard(variants.full, 'Full URL')}
            >
              Copy full URL
            </button>
          </div>
          <div className="rounded-md border border-border/70 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Short URL</p>
            <p className="mt-1 break-all font-mono text-xs">{variants.short}</p>
            <button
              type="button"
              className="mt-2 rounded border border-input px-2 py-1 text-xs"
              onClick={() => void copyToClipboard(variants.short, 'Short URL')}
            >
              Copy short URL
            </button>
          </div>
        </>
      )}
    </div>
  );
}

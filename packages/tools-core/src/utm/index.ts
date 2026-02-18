export type UtmParams = {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
};

export type UtmVariants = {
  full: string;
  short: string;
};

const VALUE_PATTERN = /^[A-Za-z0-9._~\-+% ]+$/;

const normalize = (value: string) => value.trim();

export const validateBaseUrl = (input: string): { ok: true } | { ok: false; error: string } => {
  try {
    const url = new globalThis.URL(input);
    if (!url.protocol.startsWith('http')) {
      return { ok: false, error: 'Base URL must start with http:// or https://.' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Base URL is invalid.' };
  }
};

export const validateUtmParams = (params: UtmParams): { ok: true } | { ok: false; error: string } => {
  const required: Array<keyof UtmParams> = ['source', 'medium', 'campaign'];

  for (const key of required) {
    const value = normalize(params[key] ?? '');
    if (!value) {
      return { ok: false, error: `utm_${key} is required.` };
    }
  }

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      continue;
    }

    if (!VALUE_PATTERN.test(value)) {
      return { ok: false, error: `utm_${key} contains unsupported characters.` };
    }
  }

  return { ok: true };
};

const applyParams = (url: globalThis.URL, params: UtmParams, minimal: boolean) => {
  const entries: Array<[string, string | undefined]> = [
    ['utm_source', params.source],
    ['utm_medium', params.medium],
    ['utm_campaign', params.campaign],
    ['utm_term', params.term],
    ['utm_content', params.content],
  ];

  for (const [key, rawValue] of entries) {
    if (minimal && (key === 'utm_term' || key === 'utm_content')) {
      continue;
    }

    const value = normalize(rawValue ?? '');
    if (!value) {
      continue;
    }

    url.searchParams.set(key, value);
  }
};

export const buildUtmUrl = (baseUrl: string, params: UtmParams): string => {
  const url = new globalThis.URL(baseUrl);
  applyParams(url, params, false);
  return url.toString();
};

export const buildUtmVariants = (baseUrl: string, params: UtmParams): UtmVariants => {
  const full = new globalThis.URL(baseUrl);
  applyParams(full, params, false);

  const short = new globalThis.URL(baseUrl);
  applyParams(short, params, true);

  return {
    full: full.toString(),
    short: short.toString(),
  };
};

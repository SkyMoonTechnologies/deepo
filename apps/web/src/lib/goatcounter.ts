export type GoatCounterConfig = {
  dataGoatCounter: string;
  scriptSrc: string;
};

export function resolveGoatCounterConfig(): GoatCounterConfig | null {
  const value = process.env.GOATCOUNTER_URL?.trim();

  if (!value) {
    return null;
  }

  try {
    const parsed = new globalThis.URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new TypeError('GoatCounter URL must use http or https');
    }

    return {
      dataGoatCounter: value,
      scriptSrc: `${parsed.origin}/count.js`,
    };
  } catch {
    if (process.env.NODE_ENV === 'development') {
      globalThis.console.warn(
        'Ignoring invalid GOATCOUNTER_URL: expected a valid http(s) URL.',
      );
    }
    return null;
  }
}

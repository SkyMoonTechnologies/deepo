import type { UrlSearchParams, UrlStateCodec, UrlStateQuery, UrlStateValue } from './types';

const isSerializableValue = (value: UrlStateValue): value is string | number | boolean =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

const normalizeQuery = (query: UrlStateQuery): UrlSearchParams => {
  const params = new globalThis.URLSearchParams();
  const entries = Object.entries(query).sort(([a], [b]) => a.localeCompare(b));

  for (const [key, value] of entries) {
    if (!isSerializableValue(value)) {
      continue;
    }

    const normalizedKey = key.trim();
    const normalizedValue = String(value).trim();

    if (normalizedKey.length === 0 || normalizedValue.length === 0) {
      continue;
    }

    params.set(normalizedKey, normalizedValue);
  }

  return params;
};

export const encodeUrlState = <TState>(codec: UrlStateCodec<TState>, state: TState): UrlSearchParams =>
  normalizeQuery(codec.encodeState(state));

export const decodeUrlState = <TState>(
  codec: UrlStateCodec<TState>,
  query: UrlSearchParams | string,
): TState => {
  const params =
    typeof query === 'string'
      ? new globalThis.URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
      : query;
  return codec.decodeState(params);
};

export const buildShareableHref = <TState>(
  pathname: string,
  codec: UrlStateCodec<TState>,
  state: TState,
): string | null => {
  if (!codec.isShareSafe(state)) {
    return null;
  }

  const query = encodeUrlState(codec, state).toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
};

// Example: on input change, build and push a share-safe URL from event state.
// const href = buildShareableHref('/t/utm', codec, nextState);

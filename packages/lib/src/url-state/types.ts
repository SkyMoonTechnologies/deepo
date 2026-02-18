export type UrlStateValue = string | number | boolean | null | undefined;

export type UrlStateQuery = Record<string, UrlStateValue>;

export type UrlSearchParams = globalThis.URLSearchParams;

export type UrlStateCodec<TState> = {
  encodeState: (state: TState) => UrlStateQuery;
  decodeState: (query: UrlSearchParams) => TState;
  isShareSafe: (state: TState) => boolean;
};

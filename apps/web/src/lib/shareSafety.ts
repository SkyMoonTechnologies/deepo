import {
  buildShareableHref,
  type UrlSearchParams,
  type UrlStateCodec,
  type UrlStateQuery,
  type UrlStateValue,
} from '@deepo/lib';

import { DEFAULT_SHARING_DISABLED_REASON, RISKY_TOOL_IDS } from '@/lib/privacy';

export type ShareableToolState = Record<string, UrlStateValue>;

export type ToolShareDefinition<TState extends ShareableToolState = ShareableToolState> = UrlStateCodec<TState> & {
  sharingDisabledReason?: string;
};

const SENSITIVE_KEY_PATTERN =
  /(?:secret|token|password|private|api[-_]?key|auth|authorization|signature|customer|invoice|email|phone|address|ssn)/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const JWT_PATTERN = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
const LONG_RANDOM_PATTERN = /^[A-Za-z0-9+/=_-]{48,}$/;

const sanitizeState = (state: ShareableToolState): UrlStateQuery =>
  Object.fromEntries(
    Object.entries(state).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      const isSerializable = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
      return isSerializable && String(value).trim().length > 0;
    }),
  );

const decodeState = (query: UrlSearchParams): ShareableToolState => {
  const state: ShareableToolState = {};

  for (const [key, value] of query.entries()) {
    state[key] = value;
  }

  return state;
};

const isLikelySensitiveValue = (value: string): boolean => {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return false;
  }

  return EMAIL_PATTERN.test(trimmedValue) || JWT_PATTERN.test(trimmedValue) || LONG_RANDOM_PATTERN.test(trimmedValue);
};

export const isShareSafeQuery = (query: UrlSearchParams): boolean => {
  for (const [key, value] of query.entries()) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      return false;
    }

    if (isLikelySensitiveValue(value)) {
      return false;
    }
  }

  return true;
};

const createShareDefinition = (
  options?: {
    alwaysUnsafe?: boolean;
    reason?: string;
  },
): ToolShareDefinition => ({
  encodeState: (state) => sanitizeState(state),
  decodeState,
  isShareSafe: (state) => {
    if (options?.alwaysUnsafe) {
      return false;
    }

    const params = new globalThis.URLSearchParams();

    for (const [key, value] of Object.entries(sanitizeState(state))) {
      params.set(key, String(value));
    }

    return isShareSafeQuery(params);
  },
  sharingDisabledReason: options?.reason,
});

const defaultShareDefinition = createShareDefinition();

export const toolShareDefinitions: Record<string, ToolShareDefinition> = Object.fromEntries(
  [
    'json-formatter',
    'text-diff',
    'json-semantic-diff',
    'markdown-preview',
    'jwt',
    'encoders',
    'hash-hmac',
    'regex',
    'timestamp',
    'cron',
    'uuid-ulid',
    'env-helper',
    'contrast',
    'color',
    'typography',
    'image-optimize',
    'utm',
    'unit-econ',
    'invoice-quote',
    'weekly-status',
    'meeting-notes',
    'prd',
    'adr',
    'release-notes',
  ].map((toolId) => {
    const definition = RISKY_TOOL_IDS.has(toolId)
      ? createShareDefinition({ alwaysUnsafe: true, reason: DEFAULT_SHARING_DISABLED_REASON })
      : createShareDefinition();

    return [toolId, definition];
  }),
);

export const getToolShareDefinition = (toolId: string): ToolShareDefinition =>
  toolShareDefinitions[toolId] ?? defaultShareDefinition;

export const buildToolPermalink = <TState extends ShareableToolState>(
  pathname: string,
  definition: ToolShareDefinition<TState>,
  state: TState,
): string | null => buildShareableHref(pathname, definition, state);

export const copyToolPermalink = async <TState extends ShareableToolState>(
  pathname: string,
  definition: ToolShareDefinition<TState>,
  state: TState,
): Promise<boolean> => {
  const href = buildToolPermalink(pathname, definition, state);

  const globalWindow = globalThis.window;
  const globalNavigator = globalThis.navigator;

  if (!href || !globalWindow || !globalNavigator?.clipboard) {
    return false;
  }

  const absoluteUrl = new globalThis.URL(href, globalWindow.location.origin).toString();
  await globalNavigator.clipboard.writeText(absoluteUrl);
  return true;
};

// Example: call from input handlers after state changes.
// const nextHref = buildToolPermalink('/t/utm', definition, nextState);

'use client';

import {
  clearAllLocalData,
  listFavoriteToolIds,
  listRecents,
  listToolCards,
  listToolIdsByState,
  recordRecent,
  restoreToolState,
  saveToolCard as persistToolCard,
  toggleFavoriteTool,
  type SaveToolCardInput,
} from '@deepo/lib';

export const SAVED_CARD_HREF_KEY = '__deepoHref';

function getCurrentToolHref() {
  if (typeof globalThis.window === 'undefined') {
    return undefined;
  }

  const { pathname, search } = globalThis.window.location;
  if (!pathname.startsWith('/t/')) {
    return undefined;
  }

  return `${pathname}${search}`;
}

export async function saveToolCard(input: SaveToolCardInput) {
  const href = getCurrentToolHref();
  const payload = href
    ? {
        ...input.payload,
        [SAVED_CARD_HREF_KEY]: href,
      }
    : input.payload;

  return persistToolCard({
    ...input,
    payload,
  });
}

export {
  clearAllLocalData,
  listFavoriteToolIds,
  listRecents,
  listToolCards,
  listToolIdsByState,
  recordRecent,
  restoreToolState,
  toggleFavoriteTool,
};

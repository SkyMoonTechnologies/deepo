'use client';

import { useEffect, useState } from 'react';

import {
  listFavoriteToolIds,
  listRecents,
  recordRecent,
  restoreToolState,
  toggleFavoriteTool,
} from '@/lib/client-db';
import type { ToolCatalogItem } from '@/lib/catalog';

export type ToolPersistenceState = {
  isLoaded: boolean;
  favoriteToolIds: Set<string>;
  recentToolIds: string[];
};

export function useToolPersistence() {
  const [state, setState] = useState<ToolPersistenceState>({
    isLoaded: false,
    favoriteToolIds: new Set<string>(),
    recentToolIds: [],
  });

  async function refreshState() {
    const [favoriteToolIds, recents] = await Promise.all([listFavoriteToolIds(), listRecents()]);

    setState({
      isLoaded: true,
      favoriteToolIds: new Set(favoriteToolIds),
      recentToolIds: recents.map((recent) => recent.toolId),
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialState() {
      const [favoriteToolIds, recents] = await Promise.all([listFavoriteToolIds(), listRecents()]);

      if (cancelled) {
        return;
      }

      setState({
        isLoaded: true,
        favoriteToolIds: new Set(favoriteToolIds),
        recentToolIds: recents.map((recent) => recent.toolId),
      });
    }

    void loadInitialState();

    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleFavorite(toolId: string) {
    await toggleFavoriteTool(toolId);
    await refreshState();
  }

  async function restoreTool(toolId: string) {
    await restoreToolState(toolId);
    await refreshState();
  }

  function recordToolOpen(tool: ToolCatalogItem) {
    void recordRecent(tool.id, tool.href);
  }

  return {
    ...state,
    toggleFavorite,
    restoreTool,
    recordToolOpen,
  };
}

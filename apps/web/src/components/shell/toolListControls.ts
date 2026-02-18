import { searchDocuments } from '@deepo/lib';

import type { FilterMode, SortMode } from '@/components/search/useCommandPalette';
import type { ToolCatalogItem } from '@/lib/catalog';

type ApplyToolListControlsParams = {
  tools: ToolCatalogItem[];
  sortMode: SortMode;
  filterMode: FilterMode;
  favoriteToolIds: Set<string>;
  recentToolIds: string[];
};

export function searchTools(tools: ToolCatalogItem[], query: string) {
  if (!query.trim()) {
    return tools;
  }

  const matches = searchDocuments(
    tools.map((tool) => ({
      id: tool.id,
      group: 'tools',
      title: tool.title,
      subtitle: tool.description,
      href: tool.href,
      keywords: [tool.id, tool.collectionId, ...tool.tags],
    })),
    query,
  );

  return matches.map((match) => tools.find((tool) => tool.id === match.id)).filter((tool): tool is ToolCatalogItem => Boolean(tool));
}

export function applyToolListControls({
  tools,
  sortMode,
  filterMode,
  favoriteToolIds,
  recentToolIds,
}: ApplyToolListControlsParams) {
  let visibleTools = tools;
  const recentToolIdSet = new Set(recentToolIds);

  if (filterMode === 'favorites') {
    visibleTools = visibleTools.filter((tool) => favoriteToolIds.has(tool.id));
  } else if (filterMode === 'recents') {
    visibleTools = visibleTools.filter((tool) => recentToolIdSet.has(tool.id));
  } else if (filterMode !== 'all') {
    visibleTools = visibleTools.filter((tool) => tool.collectionId === filterMode);
  }

  if (sortMode === 'name-asc') {
    visibleTools = [...visibleTools].sort((a, b) => a.title.localeCompare(b.title));
    return visibleTools;
  }

  if (sortMode === 'name-desc') {
    visibleTools = [...visibleTools].sort((a, b) => b.title.localeCompare(a.title));
    return visibleTools;
  }

  if (sortMode === 'collection') {
    visibleTools = [...visibleTools].sort((a, b) => {
      const collectionCompare = a.collectionId.localeCompare(b.collectionId);
      if (collectionCompare !== 0) {
        return collectionCompare;
      }
      return a.title.localeCompare(b.title);
    });
    return visibleTools;
  }

  if (sortMode === 'favorites-first') {
    visibleTools = [...visibleTools].sort((a, b) => {
      const aFavorite = favoriteToolIds.has(a.id);
      const bFavorite = favoriteToolIds.has(b.id);
      if (aFavorite === bFavorite) {
        return a.title.localeCompare(b.title);
      }
      return aFavorite ? -1 : 1;
    });
    return visibleTools;
  }

  const recentIndexById = new Map(recentToolIds.map((toolId, index) => [toolId, index]));

  visibleTools = [...visibleTools].sort((a, b) => {
    const aRecentIndex = recentIndexById.get(a.id);
    const bRecentIndex = recentIndexById.get(b.id);

    if (aRecentIndex === undefined && bRecentIndex === undefined) {
      return 0;
    }

    if (aRecentIndex === undefined) {
      return 1;
    }

    if (bRecentIndex === undefined) {
      return -1;
    }

    return aRecentIndex - bRecentIndex;
  });

  return visibleTools;
}

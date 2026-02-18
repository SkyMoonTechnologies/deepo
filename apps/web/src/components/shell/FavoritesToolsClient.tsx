'use client';

import { useCommandPalette } from '@/components/search/useCommandPalette';
import { StatsRow } from '@/components/shell/StatsRow';
import { ToolTiles } from '@/components/shell/ToolTiles';
import { applyToolListControls, searchTools } from '@/components/shell/toolListControls';
import { tools } from '@/lib/catalog';

import { useToolPersistence } from './useToolPersistence';

export function FavoritesToolsClient() {
  const { topbarQuery, viewMode, sortMode, filterMode } = useCommandPalette();
  const { isLoaded, favoriteToolIds, recentToolIds, toggleFavorite, recordToolOpen } =
    useToolPersistence();

  const activeTools = isLoaded ? tools.filter((tool) => favoriteToolIds.has(tool.id)) : [];
  const searchVisibleTools = searchTools(activeTools, topbarQuery);
  const visibleTools = applyToolListControls({
    tools: searchVisibleTools,
    sortMode,
    filterMode,
    favoriteToolIds,
    recentToolIds,
  });

  return (
    <div className="space-y-6">
      <StatsRow
        title="Favorites"
        visibleCount={visibleTools.length}
        totalCount={tools.length}
        favoriteCount={favoriteToolIds.size}
        recentCount={recentToolIds.length}
      />
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your pinned tools are stored locally in IndexedDB.
        </p>
      </section>
      {isLoaded ? (
        <ToolTiles
          tools={visibleTools}
          viewMode={viewMode}
          favoriteToolIds={favoriteToolIds}
          onToggleFavorite={toggleFavorite}
          onOpenTool={recordToolOpen}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Loading favorites...</p>
      )}
    </div>
  );
}

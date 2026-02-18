'use client';

import { useCommandPalette } from '@/components/search/useCommandPalette';
import { StatsRow } from '@/components/shell/StatsRow';
import { ToolTiles } from '@/components/shell/ToolTiles';
import { applyToolListControls, searchTools } from '@/components/shell/toolListControls';
import { tools, type ToolCatalogItem } from '@/lib/catalog';

import { useToolPersistence } from './useToolPersistence';

const toolById = new Map(tools.map((tool) => [tool.id, tool]));

function isToolCatalogItem(tool: ToolCatalogItem | undefined): tool is ToolCatalogItem {
  return Boolean(tool);
}

export function RecentsToolsClient() {
  const { topbarQuery, viewMode, sortMode, filterMode } = useCommandPalette();
  const { isLoaded, favoriteToolIds, recentToolIds, toggleFavorite, recordToolOpen } =
    useToolPersistence();

  const activeTools = isLoaded
    ? recentToolIds.map((toolId) => toolById.get(toolId)).filter(isToolCatalogItem)
    : [];
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
        title="Recents"
        visibleCount={visibleTools.length}
        totalCount={tools.length}
        favoriteCount={favoriteToolIds.size}
        recentCount={recentToolIds.length}
      />
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Recents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recent tool usage is captured on tile clicks.
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
        <p className="text-sm text-muted-foreground">Loading recents...</p>
      )}
    </div>
  );
}

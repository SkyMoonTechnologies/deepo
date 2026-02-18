'use client';

import { useCommandPalette } from '@/components/search/useCommandPalette';
import { StatsRow } from '@/components/shell/StatsRow';
import { ToolTiles } from '@/components/shell/ToolTiles';
import { applyToolListControls, searchTools } from '@/components/shell/toolListControls';
import type { ToolCatalogItem } from '@/lib/catalog';

import { useToolPersistence } from './useToolPersistence';

type CatalogToolsClientProps = {
  title: string;
  description: string;
  tools: ToolCatalogItem[];
  totalCount: number;
};

export function CatalogToolsClient({
  title,
  description,
  tools,
  totalCount,
}: CatalogToolsClientProps) {
  const { topbarQuery, viewMode, sortMode, filterMode } = useCommandPalette();
  const { isLoaded, favoriteToolIds, recentToolIds, toggleFavorite, recordToolOpen } =
    useToolPersistence();

  const activeTools = isLoaded ? tools : [];
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
        title={title}
        visibleCount={visibleTools.length}
        totalCount={totalCount}
        favoriteCount={favoriteToolIds.size}
        recentCount={recentToolIds.length}
      />
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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
        <p className="text-sm text-muted-foreground">Loading saved tool state...</p>
      )}
    </div>
  );
}

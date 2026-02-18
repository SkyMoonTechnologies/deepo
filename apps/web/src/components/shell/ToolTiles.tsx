'use client';

import Link from 'next/link';
import {
  BadgeCheck,
  Binary,
  BookOpenText,
  Braces,
  CalendarClock,
  ClipboardList,
  Clock3,
  FileCode2,
  FileText,
  Fingerprint,
  GitCompareArrows,
  Hash,
  Heart,
  Image,
  Leaf,
  LineChart,
  Link2,
  Megaphone,
  MoreHorizontal,
  NotebookPen,
  Palette,
  ReceiptText,
  RotateCcw,
  ScanSearch,
  ScrollText,
  ShieldCheck,
  SplitSquareVertical,
  Type,
} from 'lucide-react';

import type { ViewMode } from '@/components/search/useCommandPalette';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIconName, ToolCatalogItem } from '@/lib/catalog';

const iconMap: Record<LucideIconName, typeof Braces> = {
  Braces,
  ShieldCheck,
  Binary,
  Hash,
  ScanSearch,
  Clock3,
  CalendarClock,
  Fingerprint,
  Leaf,
  FileCode2,
  GitCompareArrows,
  SplitSquareVertical,
  BadgeCheck,
  Palette,
  Type,
  Image,
  Link2,
  LineChart,
  ReceiptText,
  FileText,
  ScrollText,
  NotebookPen,
  ClipboardList,
  Megaphone,
  BookOpenText,
};

type ToolTilesProps = {
  tools: ToolCatalogItem[];
  viewMode?: ViewMode;
  favoriteToolIds?: Set<string>;
  onToggleFavorite?: (toolId: string) => void | Promise<void>;
  onRestore?: (toolId: string) => void | Promise<void>;
  onOpenTool?: (tool: ToolCatalogItem) => void | Promise<void>;
};

export function ToolTiles({
  tools,
  viewMode = 'grid',
  favoriteToolIds = new Set<string>(),
  onToggleFavorite,
  onRestore,
  onOpenTool,
}: ToolTilesProps) {
  const isListView = viewMode === 'list';

  if (!tools.length) {
    return (
      <Card className="border-dashed border-border/70">
        <CardContent className="p-8 text-center text-muted-foreground">
          No tools in this view yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <section
      aria-label="Tool results"
      className={isListView ? 'grid gap-2' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'}
    >
      {tools.map((tool) => {
        const Icon = iconMap[tool.icon] ?? Braces;
        const isFavorited = favoriteToolIds.has(tool.id);
        const visibleTags = isListView ? tool.tags.slice(0, 3) : tool.tags;

        if (isListView) {
          return (
            <Card key={tool.id} className="border-border/70">
              <div className="flex items-center gap-2 px-2.5 py-1.5">
                <div className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-secondary text-secondary-foreground">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </div>

                <Link
                  href={tool.href}
                  className="flex min-w-0 flex-1 items-center gap-2 text-sm"
                  onClick={() => {
                    void onOpenTool?.(tool);
                  }}
                >
                  <span className="truncate font-medium text-foreground">{tool.title}</span>
                  <span className="hidden truncate text-xs text-muted-foreground md:inline">
                    {tool.description}
                  </span>
                  <span className="hidden truncate text-[11px] text-muted-foreground lg:inline">
                    {visibleTags.join(' • ')}
                  </span>
                </Link>

                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    aria-label={isFavorited ? `Unfavorite ${tool.title}` : `Favorite ${tool.title}`}
                    onClick={() => {
                      void onToggleFavorite?.(tool.id);
                    }}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${isFavorited ? 'fill-current' : ''}`}
                      aria-hidden="true"
                    />
                  </Button>

                  <details className="relative">
                    <summary
                      className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`Open actions for ${tool.title}`}
                      aria-haspopup="menu"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">Open actions for {tool.title}</span>
                    </summary>
                    <div className="absolute right-0 z-10 mt-1 w-44 rounded-md border border-border bg-popover p-1 text-sm shadow-md">
                      <Link
                        href={tool.href}
                        className="block rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => {
                          void onOpenTool?.(tool);
                        }}
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        className="block w-full rounded px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => {
                          void onToggleFavorite?.(tool.id);
                        }}
                      >
                        {isFavorited ? 'Unfavorite' : 'Favorite'}
                      </button>

                      {onRestore ? (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => {
                            void onRestore(tool.id);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          Restore
                        </button>
                      ) : null}
                    </div>
                  </details>
                </div>
              </div>
            </Card>
          );
        }

        return (
          <Card
            key={tool.id}
            className="group border-border/70 transition hover:border-border hover:bg-card"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  aria-label={isFavorited ? `Unfavorite ${tool.title}` : `Favorite ${tool.title}`}
                  onClick={() => {
                    void onToggleFavorite?.(tool.id);
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`}
                    aria-hidden="true"
                  />
                </Button>

                <details className="relative">
                  <summary
                    className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`Open actions for ${tool.title}`}
                    aria-haspopup="menu"
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Open actions for {tool.title}</span>
                  </summary>
                  <div className="absolute right-0 z-10 mt-1 w-44 rounded-md border border-border bg-popover p-1 text-sm shadow-md">
                    <Link
                      href={tool.href}
                      className="block rounded px-2 py-1.5 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => {
                        void onOpenTool?.(tool);
                      }}
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      className="block w-full rounded px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => {
                        void onToggleFavorite?.(tool.id);
                      }}
                    >
                      {isFavorited ? 'Unfavorite' : 'Favorite'}
                    </button>

                    {onRestore ? (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => {
                          void onRestore(tool.id);
                        }}
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Restore
                      </button>
                    ) : null}
                  </div>
                </details>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <Link
                href={tool.href}
                className="block"
                onClick={() => {
                  void onOpenTool?.(tool);
                }}
              >
                <CardTitle className="text-base">{tool.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
              </Link>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {visibleTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-secondary/30 text-[11px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

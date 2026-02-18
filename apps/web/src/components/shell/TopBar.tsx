'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpDown, ChevronRight, Filter, Grid3X3, List, Search } from 'lucide-react';

import { useCommandPalette } from '@/components/search/useCommandPalette';
import { Button } from '@/components/ui/button';
import { collectionById, tools, type CollectionId } from '@/lib/catalog';

type TopBarProps = {
  mode: 'catalog' | 'tools';
};

type Crumb = {
  label: string;
  href?: string;
};

const sortOptions = [
  { value: 'recent', label: 'Recent' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'collection', label: 'Collection' },
  { value: 'favorites-first', label: 'Favorites First' },
] as const;

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'recents', label: 'Recents' },
  { value: 'build', label: 'Build' },
  { value: 'ship', label: 'Ship' },
  { value: 'design', label: 'Design' },
  { value: 'operate', label: 'Operate' },
  { value: 'write', label: 'Write' },
] as const;

function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname === '/') {
    return [{ label: 'All Tools' }];
  }

  if (pathname.startsWith('/t/')) {
    const toolPath = pathname.split('/').slice(0, 3).join('/');
    const tool = tools.find((item) => item.href === toolPath);
    return [{ label: 'All Tools', href: '/' }, { label: tool?.title ?? 'Tool' }];
  }

  if (pathname.startsWith('/c/')) {
    const collectionId = pathname.split('/')[2] as CollectionId;
    const collection = collectionById.get(collectionId);
    return [{ label: 'All Tools', href: '/' }, { label: collection?.name ?? 'Collection' }];
  }

  const systemPages = new Map<string, string>([
    ['/favorites', 'Favorites'],
    ['/recents', 'Recents'],
    ['/cards', 'Saved Cards'],
  ]);

  const pageLabel = systemPages.get(pathname);

  if (pageLabel) {
    return [{ label: 'All Tools', href: '/' }, { label: pageLabel }];
  }

  return [{ label: 'All Tools', href: '/' }];
}

export function TopBar({ mode }: TopBarProps) {
  const pathname = usePathname();
  const {
    topbarQuery,
    setTopbarQuery,
    viewMode,
    setViewMode,
    sortMode,
    setSortMode,
    filterMode,
    setFilterMode,
    setIsOpen,
  } = useCommandPalette();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                  {index > 0 ? (
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  ) : null}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="truncate text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="truncate text-foreground">{crumb.label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {mode === 'tools' ? (
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="h-9"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-[220px] flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search tools"
                value={topbarQuery}
                onChange={(event) => {
                  setTopbarQuery(event.target.value);
                }}
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </label>

            <div className="inline-flex items-center rounded-md border border-input p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                type="button"
                className="h-8 px-2"
                onClick={() => {
                  setViewMode('grid');
                }}
              >
                <Grid3X3 className="h-4 w-4" aria-hidden="true" />
                Grid
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                type="button"
                className="h-8 px-2"
                onClick={() => {
                  setViewMode('list');
                }}
              >
                <List className="h-4 w-4" aria-hidden="true" />
                List
              </Button>
            </div>

            <label className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-2.5">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Sort</span>
              <select
                value={sortMode}
                onChange={(event) => {
                  setSortMode(event.target.value as (typeof sortOptions)[number]['value']);
                }}
                className="h-9 bg-transparent text-sm outline-none"
                aria-label="Sort tools"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-2.5">
              <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Filter</span>
              <select
                value={filterMode}
                onChange={(event) => {
                  setFilterMode(event.target.value as (typeof filterOptions)[number]['value']);
                }}
                className="h-9 bg-transparent text-sm outline-none"
                aria-label="Filter tools"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>
    </header>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, ChevronDown, ChevronRight, Heart, RotateCcw, Search, Tags } from 'lucide-react';

import type { Collection } from '@/lib/catalog';
import { useCommandPalette } from '@/components/search/useCommandPalette';
import { cn } from '@/components/ui/utils';

type TagItem = {
  name: string;
  count: number;
};

type SidebarProps = {
  collections: Collection[];
  tags: TagItem[];
};

const systemLinks = [
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/recents', label: 'Recents', icon: RotateCcw },
  { href: '/cards', label: 'Saved Cards', icon: Bookmark },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ collections, tags }: SidebarProps) {
  const pathname = usePathname();
  const { setIsOpen } = useCommandPalette();
  const [isTagsCollapsed, setIsTagsCollapsed] = useState(tags.length > 10);

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border/70 bg-card/40 px-4 py-5 md:block">
      <button
        type="button"
        className="mb-6 w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/40"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <span className="mb-1 flex items-center gap-2 font-medium text-foreground">
          <Search className="h-4 w-4" aria-hidden="true" />
          Global Search
        </span>
        <span>
          Press <kbd className="rounded bg-secondary px-1.5 py-0.5 text-xs">/</kbd> to search tools
        </span>
      </button>

      <div className="mb-6 space-y-1">
        <p className="mb-2 px-2 text-xs uppercase tracking-wide text-muted-foreground">
          Collections
        </p>
        <ul className="space-y-1">
          <li>
            <Link
              className={cn(
                'block rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive(pathname, '/') && 'bg-accent text-accent-foreground',
              )}
              href="/"
            >
              All Tools
            </Link>
          </li>
          <li className="ml-3 border-l border-border/70 pl-2">
            <ul className="space-y-1">
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link
                    className={cn(
                      'block rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                      isActive(pathname, `/c/${collection.id}`) &&
                        'bg-accent text-accent-foreground',
                    )}
                    href={`/c/${collection.id}`}
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>

      <div className="mb-6">
        <button
          type="button"
          className="mb-2 flex w-full items-center justify-between rounded-md px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground"
          onClick={() => setIsTagsCollapsed((prev) => !prev)}
          aria-expanded={!isTagsCollapsed}
          aria-controls="sidebar-tags-list"
        >
          <span className="flex items-center gap-2">
            <Tags className="h-3.5 w-3.5" aria-hidden="true" /> Tags
          </span>
          {isTagsCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
        <ul id="sidebar-tags-list" className={cn('space-y-1', isTagsCollapsed && 'hidden')}>
          {tags.map((tag) => (
            <li
              key={tag.name}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground"
            >
              <span>{tag.name}</span>
              <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
                {tag.count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-1">
        <p className="mb-2 px-2 text-xs uppercase tracking-wide text-muted-foreground">System</p>
        {systemLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive(pathname, link.href) && 'bg-accent text-accent-foreground',
              )}
              href={link.href}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

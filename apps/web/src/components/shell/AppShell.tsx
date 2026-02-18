'use client';

import type { ReactNode } from 'react';

import { CommandPalette } from '@/components/search/CommandPalette';
import { CommandPaletteProvider } from '@/components/search/useCommandPalette';
import { Sidebar } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';
import type { Collection } from '@/lib/catalog';

type TagItem = {
  name: string;
  count: number;
};

type AppShellProps = {
  collections: Collection[];
  tags: TagItem[];
  children: ReactNode;
  mode?: 'catalog' | 'tools';
};

export function AppShell({ collections, tags, children, mode = 'catalog' }: AppShellProps) {
  return (
    <CommandPaletteProvider>
      <div className="flex min-h-screen bg-background/90">
        <Sidebar collections={collections} tags={tags} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar mode={mode} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
      <CommandPalette />
    </CommandPaletteProvider>
  );
}

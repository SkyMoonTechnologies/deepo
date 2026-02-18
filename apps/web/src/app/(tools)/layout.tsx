import type { ReactNode } from 'react';

import { AppShell } from '@/components/shell/AppShell';
import { collections, tags } from '@/lib/catalog';

type ToolsLayoutProps = {
  children: ReactNode;
};

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <AppShell collections={collections} tags={tags} mode="tools">
      {children}
    </AppShell>
  );
}

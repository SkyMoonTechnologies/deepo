import type { ReactNode } from 'react';

import { AppShell } from '@/components/shell/AppShell';
import { collections, tags } from '@/lib/catalog';

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AppShell collections={collections} tags={tags} mode="catalog">
      {children}
    </AppShell>
  );
}

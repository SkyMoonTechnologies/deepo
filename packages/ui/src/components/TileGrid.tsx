import type { ReactNode } from 'react';

type TileGridProps = {
  children: ReactNode;
};

export function TileGrid({ children }: TileGridProps) {
  return <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</ul>;
}

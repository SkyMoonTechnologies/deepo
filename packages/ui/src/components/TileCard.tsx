import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { TagPills } from './TagPills';

type TileCardProps = {
  title: string;
  description: string;
  tags: string[];
  href: string;
  icon?: ReactNode;
};

export function TileCard({ title, description, tags, href, icon }: TileCardProps) {
  return (
    <li>
      <a
        href={href}
        className="group block rounded-xl border border-border/80 bg-card/95 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.6)] transition hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/80 bg-secondary/70 text-foreground">
            {icon}
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <TagPills tags={tags} />
      </a>
    </li>
  );
}

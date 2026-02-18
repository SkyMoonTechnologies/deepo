import { Wrench } from 'lucide-react';

type AppIconProps = {
  title: string;
};

export function AppIcon({ title }: AppIconProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-secondary/70 text-foreground">
        <Wrench className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-medium leading-tight text-muted-foreground">Deepo</p>
        <p className="text-base font-semibold leading-tight text-foreground">{title}</p>
      </div>
    </div>
  );
}

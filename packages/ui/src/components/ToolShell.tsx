import type { ReactNode } from 'react';

type ToolShellProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  shareWarning?: string;
  sensitiveInputWarning?: string;
  left: ReactNode;
  right: ReactNode;
};

export function ToolShell({ title, description, actions, shareWarning, sensitiveInputWarning, left, right }: ToolShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>
      {shareWarning ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          {shareWarning}
        </p>
      ) : null}
      {sensitiveInputWarning ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-900 dark:text-red-100">
          <span className="font-semibold">Sensitive input:</span> {sensitiveInputWarning}
        </p>
      ) : null}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-card/95 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.6)]">
          {left}
        </div>
        <div className="rounded-xl border border-border/80 bg-card/95 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.6)]">
          {right}
        </div>
      </section>
    </main>
  );
}

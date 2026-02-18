'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { notifyActionError } from '@/lib/action-feedback';

type ToolsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ToolsError({ error, reset }: ToolsErrorProps) {
  useEffect(() => {
    notifyActionError('Tool page load');
    globalThis.console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 rounded-lg border border-destructive/40 bg-destructive/5 p-6">
      <h1 className="text-lg font-semibold text-destructive">Something went wrong in this tool.</h1>
      <p className="text-sm text-muted-foreground">
        The error boundary prevented the rest of the app from crashing. You can retry the current
        tool page.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}

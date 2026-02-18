'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { notifyActionError } from '@/lib/action-feedback';
import { clearAllLocalData } from '@/lib/client-db';

export default function SettingsPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClearLocalData = async () => {
    const confirmed = globalThis.window.confirm(
      'Clear all local data? This removes saved cards, favorites, and recents from this browser.',
    );

    if (!confirmed) {
      return;
    }

    setIsClearing(true);
    setStatusMessage(null);

    try {
      await clearAllLocalData();
      setStatusMessage('Local data cleared.');
    } catch {
      notifyActionError('Clear local data');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Privacy controls for data stored in this browser.
        </p>
      </header>

      <div className="rounded-xl border border-border/80 bg-card/95 p-4">
        <h2 className="text-sm font-semibold">Local data</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Deepo stores favorites, recents, and saved cards in IndexedDB. Use this control to wipe
          everything.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleClearLocalData()}
            disabled={isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear local data'}
          </Button>
          {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}
        </div>
      </div>
    </section>
  );
}

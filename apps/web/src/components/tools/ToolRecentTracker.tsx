'use client';

import { useEffect } from 'react';

import { recordRecent } from '@/lib/client-db';

type ToolRecentTrackerProps = {
  toolId: string;
  href: string;
};

export default function ToolRecentTracker({ toolId, href }: ToolRecentTrackerProps) {
  useEffect(() => {
    void recordRecent(toolId, href);
  }, [href, toolId]);

  return null;
}

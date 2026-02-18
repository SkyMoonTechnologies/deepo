'use client';

import dynamic from 'next/dynamic';

import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';

const ToolClient = dynamic(() => import('./ToolClient'), { ssr: false });

type ToolClientLoaderProps = {
  panel: ToolPanel;
};

export default function ToolClientLoader({ panel }: ToolClientLoaderProps) {
  return <ToolClient panel={panel} />;
}

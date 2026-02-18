import type { ComponentType } from 'react';

import { Button } from '@/components/ui/button';
import { tools } from '@/lib/catalog';
import { getSensitiveInputWarning } from '@/lib/privacy';
import { getToolShareDefinition } from '@/lib/shareSafety';
import { ToolShell } from '@deepo/ui';
import { notFound } from 'next/navigation';

import type { ToolPanel } from './ToolPlaceholderClient';
import ToolPermalinkAction from './ToolPermalinkAction';
import ToolRecentTracker from './ToolRecentTracker';

type ToolPageProps = {
  toolId: string;
  ToolClient: ComponentType<{ panel: ToolPanel }>;
};

export default function ToolPage({ toolId, ToolClient }: ToolPageProps) {
  const tool = tools.find((entry) => entry.id === toolId);

  if (!tool) {
    notFound();
  }

  const shareDefinition = getToolShareDefinition(tool.id);
  const sharingEnabled = shareDefinition.isShareSafe({});
  const sensitiveInputWarning = getSensitiveInputWarning(tool.id);

  return (
    <>
      <ToolRecentTracker toolId={tool.id} href={tool.href} />
      <ToolShell
        title={tool.title}
        description={tool.description}
        shareWarning={sharingEnabled ? undefined : shareDefinition.sharingDisabledReason}
        sensitiveInputWarning={sensitiveInputWarning}
        actions={
          <>
            <ToolPermalinkAction toolId={tool.id} href={tool.href} />
            <Button variant="outline" size="sm" disabled>
              Download
            </Button>
            <Button variant="outline" size="sm" disabled>
              Save card
            </Button>
            <Button variant="secondary" size="sm">
              Clear
            </Button>
          </>
        }
        left={<ToolClient panel="input" />}
        right={<ToolClient panel="output" />}
      />
    </>
  );
}

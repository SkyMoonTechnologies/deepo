'use client';

import { Button } from '@/components/ui/button';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { copyToolPermalink, getToolShareDefinition, type ShareableToolState } from '@/lib/shareSafety';

const EMPTY_STATE: ShareableToolState = {};

type ToolPermalinkActionProps = {
  toolId: string;
  href: string;
};

export default function ToolPermalinkAction({ toolId, href }: ToolPermalinkActionProps) {
  const shareDefinition = getToolShareDefinition(toolId);
  const canShare = shareDefinition.isShareSafe(EMPTY_STATE);

  if (!canShare) {
    return null;
  }

  const handleCopyPermalink = async () => {
    try {
      const copied = await copyToolPermalink(href, shareDefinition, EMPTY_STATE);
      if (!copied) {
        notifyActionError('Copy permalink');
        return;
      }

      notifyAction('copy', 'Permalink copied to clipboard.');
    } catch {
      notifyActionError('Copy permalink');
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopyPermalink}>
      Copy Permalink
    </Button>
  );
}

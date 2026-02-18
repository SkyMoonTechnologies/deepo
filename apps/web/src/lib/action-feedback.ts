'use client';

import { toast } from '@/components/ui/use-toast';

type ActionKind = 'copy' | 'download' | 'save';

function actionTitle(kind: ActionKind): string {
  if (kind === 'copy') {
    return 'Copied';
  }

  if (kind === 'download') {
    return 'Download started';
  }

  return 'Saved';
}

export function notifyAction(kind: ActionKind, description: string) {
  toast({
    title: actionTitle(kind),
    description,
  });
}

export function notifyActionError(action: string) {
  toast({
    title: `${action} failed`,
    description: 'Please try again.',
    variant: 'destructive',
  });
}

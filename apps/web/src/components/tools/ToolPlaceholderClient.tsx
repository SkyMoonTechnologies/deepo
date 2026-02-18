'use client';

export type ToolPanel = 'input' | 'output';

type ToolPlaceholderClientProps = {
  panel: ToolPanel;
};

export default function ToolPlaceholderClient({ panel }: ToolPlaceholderClientProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-foreground">{panel === 'input' ? 'Input' : 'Output'}</h2>
      <p className="text-sm text-muted-foreground">Coming next</p>
    </div>
  );
}

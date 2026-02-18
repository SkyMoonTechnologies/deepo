import { CatalogToolsClient } from '@/components/shell/CatalogToolsClient';
import { tools } from '@/lib/catalog';

export default function AllToolsPage() {
  return (
    <CatalogToolsClient
      title="All Tools"
      description="Browse the full catalog of mini tools."
      tools={tools}
      totalCount={tools.length}
    />
  );
}

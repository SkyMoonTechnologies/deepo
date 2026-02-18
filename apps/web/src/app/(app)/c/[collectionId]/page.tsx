import { notFound } from 'next/navigation';

import { CatalogToolsClient } from '@/components/shell/CatalogToolsClient';
import { tools, toolsByCollectionId, collectionById, type CollectionId } from '@/lib/catalog';

type CollectionPageProps = {
  params: Promise<{
    collectionId: string;
  }>;
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collectionId } = await params;
  const normalizedCollectionId = collectionId as CollectionId;
  const collection = collectionById.get(normalizedCollectionId);

  if (!collection) {
    notFound();
  }

  const collectionTools = toolsByCollectionId[normalizedCollectionId];

  return (
    <CatalogToolsClient
      title={collection.name}
      description={collection.description}
      tools={collectionTools}
      totalCount={tools.length}
    />
  );
}

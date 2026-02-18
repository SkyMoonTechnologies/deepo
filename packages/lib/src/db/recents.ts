import { getDb } from './client';
import type { Recent } from './schema';

export async function recordRecent(toolId: string, href: string): Promise<void> {
  const db = await getDb();

  await db.put('recents', {
    toolId,
    href,
    lastUsedAt: new Date().toISOString(),
  });
}

export async function listRecents(limit = 100): Promise<Recent[]> {
  const db = await getDb();
  const allRecents = await db.getAllFromIndex('recents', 'byLastUsedAt');

  return allRecents.sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt)).slice(0, limit);
}

import { getDb } from './client';
import type { Favorite } from './schema';

export async function listFavorites(): Promise<Favorite[]> {
  const db = await getDb();
  const records = await db.getAllFromIndex('favorites', 'byPinnedAt');

  return records.sort((a, b) => b.pinnedAt.localeCompare(a.pinnedAt));
}

export async function listFavoriteToolIds(): Promise<string[]> {
  const favorites = await listFavorites();
  return favorites.map((favorite) => favorite.toolId);
}

export async function isFavorited(toolId: string): Promise<boolean> {
  const db = await getDb();
  const existing = await db.get('favorites', toolId);
  return Boolean(existing);
}

export async function setFavorite(toolId: string, shouldFavorite: boolean): Promise<void> {
  const db = await getDb();

  if (shouldFavorite) {
    await db.put('favorites', {
      toolId,
      pinnedAt: new Date().toISOString(),
    });
    return;
  }

  await db.delete('favorites', toolId);
}

export async function toggleFavoriteTool(toolId: string): Promise<boolean> {
  const alreadyFavorited = await isFavorited(toolId);
  const nextFavoritedState = !alreadyFavorited;
  await setFavorite(toolId, nextFavoritedState);
  return nextFavoritedState;
}

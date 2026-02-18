import { getDb } from './client';

const LOCAL_STORE_NAMES = ['cards', 'favorites', 'recents', 'toolState'] as const;

export async function clearAllLocalData(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(LOCAL_STORE_NAMES, 'readwrite');

  await Promise.all(LOCAL_STORE_NAMES.map((storeName) => tx.objectStore(storeName).clear()));
  await tx.done;
}

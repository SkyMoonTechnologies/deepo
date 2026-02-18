import { openDB, type IDBPDatabase } from 'idb';

import type { DeepoDbSchema } from './schema';

const DB_NAME = 'deepo-local-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DeepoDbSchema>> | null = null;

export function getDb(): Promise<IDBPDatabase<DeepoDbSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<DeepoDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cards')) {
          const cards = db.createObjectStore('cards', { keyPath: 'id' });
          cards.createIndex('byToolId', 'toolId');
          cards.createIndex('byUpdatedAt', 'updatedAt');
        }

        if (!db.objectStoreNames.contains('favorites')) {
          const favorites = db.createObjectStore('favorites', { keyPath: 'toolId' });
          favorites.createIndex('byPinnedAt', 'pinnedAt');
        }

        if (!db.objectStoreNames.contains('recents')) {
          const recents = db.createObjectStore('recents', { keyPath: 'toolId' });
          recents.createIndex('byLastUsedAt', 'lastUsedAt');
        }

        if (!db.objectStoreNames.contains('toolState')) {
          const toolState = db.createObjectStore('toolState', { keyPath: 'toolId' });
          toolState.createIndex('byState', 'state');
          toolState.createIndex('byUpdatedAt', 'updatedAt');
        }
      },
    });
  }

  return dbPromise;
}

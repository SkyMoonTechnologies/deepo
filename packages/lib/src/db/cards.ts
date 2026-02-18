import { getDb } from './client';
import type { ToolCard } from './schema';

export type SaveToolCardInput = {
  id: string;
  toolId: string;
  title: string;
  payload: Record<string, unknown>;
};

export async function saveToolCard(input: SaveToolCardInput): Promise<ToolCard> {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await db.get('cards', input.id);

  const card: ToolCard = {
    id: input.id,
    toolId: input.toolId,
    title: input.title,
    payload: input.payload,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await db.put('cards', card);

  return card;
}

export async function getToolCardById(cardId: string): Promise<ToolCard | undefined> {
  const db = await getDb();
  return db.get('cards', cardId);
}

export async function listToolCardsByToolId(toolId: string): Promise<ToolCard[]> {
  const db = await getDb();
  const records = await db.getAllFromIndex('cards', 'byToolId', toolId);

  return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listToolCards(limit = 100): Promise<ToolCard[]> {
  const db = await getDb();
  const records = await db.getAllFromIndex('cards', 'byUpdatedAt');

  return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit);
}

export async function deleteToolCard(cardId: string): Promise<void> {
  const db = await getDb();
  await db.delete('cards', cardId);
}

import { getDb } from './client';
import type { ToolState, ToolStateValue } from './schema';

export async function setToolState(toolId: string, state: ToolStateValue): Promise<void> {
  const db = await getDb();

  await db.put('toolState', {
    toolId,
    state,
    updatedAt: new Date().toISOString(),
  });
}

export async function getToolState(toolId: string): Promise<ToolStateValue> {
  const db = await getDb();
  const record = await db.get('toolState', toolId);
  return record?.state ?? 'active';
}

export async function listToolStatesByState(state: ToolStateValue): Promise<ToolState[]> {
  const db = await getDb();
  const records = await db.getAllFromIndex('toolState', 'byState', state);

  return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listToolIdsByState(state: ToolStateValue): Promise<string[]> {
  const states = await listToolStatesByState(state);
  return states.map((record) => record.toolId);
}

export async function restoreToolState(toolId: string): Promise<void> {
  await setToolState(toolId, 'active');
}

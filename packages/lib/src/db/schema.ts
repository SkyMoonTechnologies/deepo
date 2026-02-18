import type { DBSchema } from 'idb';

export type ToolCard = {
  id: string;
  toolId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  payload: Record<string, unknown>;
};

export type Favorite = {
  toolId: string;
  pinnedAt: string;
};

export type Recent = {
  toolId: string;
  lastUsedAt: string;
  href: string;
};

export type ToolStateValue = 'active';

export type ToolState = {
  toolId: string;
  state: ToolStateValue;
  updatedAt: string;
};

export type DeepoDbSchema = DBSchema & {
  cards: {
    key: string;
    value: ToolCard;
    indexes: {
      byToolId: string;
      byUpdatedAt: string;
    };
  };
  favorites: {
    key: string;
    value: Favorite;
    indexes: {
      byPinnedAt: string;
    };
  };
  recents: {
    key: string;
    value: Recent;
    indexes: {
      byLastUsedAt: string;
    };
  };
  toolState: {
    key: string;
    value: ToolState;
    indexes: {
      byState: string;
      byUpdatedAt: string;
    };
  };
};

export type SearchGroup = 'tools' | 'recents' | 'cards';

export type SearchDocument = {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle?: string;
  href?: string;
  keywords?: string[];
  updatedAt?: string;
};

export type SearchResult = SearchDocument & {
  score: number;
};

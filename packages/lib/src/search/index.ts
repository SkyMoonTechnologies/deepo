import type { SearchDocument, SearchResult } from './types';
import { scoreField, tokenizeQuery } from './scoring';

export type SearchDocumentsOptions = {
  limit?: number;
};

export function searchDocuments(documents: SearchDocument[], query: string, options: SearchDocumentsOptions = {}): SearchResult[] {
  const tokens = tokenizeQuery(query);
  const limit = options.limit ?? Number.POSITIVE_INFINITY;

  if (!tokens.length) {
    return documents.slice(0, limit).map((document) => ({
      ...document,
      score: 0,
    }));
  }

  const ranked = documents
    .map((document) => {
      const keywordScore = (document.keywords ?? []).reduce((acc, keyword) => acc + scoreField(keyword, tokens), 0);
      const titleScore = scoreField(document.title, tokens) * 2;
      const subtitleScore = scoreField(document.subtitle ?? '', tokens);
      const score = titleScore + subtitleScore + keywordScore;

      return {
        ...document,
        score,
      };
    })
    .filter((document) => document.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const bUpdated = b.updatedAt ?? '';
      const aUpdated = a.updatedAt ?? '';

      if (bUpdated !== aUpdated) {
        return bUpdated.localeCompare(aUpdated);
      }

      return a.title.localeCompare(b.title);
    });

  return ranked.slice(0, limit);
}

export type { SearchDocument, SearchGroup, SearchResult } from './types';

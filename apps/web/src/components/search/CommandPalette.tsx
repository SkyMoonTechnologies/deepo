'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { listFavoriteToolIds, listRecents, listToolCards, SAVED_CARD_HREF_KEY } from '@/lib/client-db';
import { tools, type ToolCatalogItem } from '@/lib/catalog';
import { useCommandPalette } from '@/components/search/useCommandPalette';
import { searchDocuments, type SearchDocument } from '@deepo/lib';

type RecentTool = {
  toolId: string;
  title: string;
  href: ToolCatalogItem['href'];
  updatedAt: string;
};

type CardResult = {
  id: string;
  title: string;
  toolId: string;
  href: string;
  updatedAt: string;
};

const toolById = new Map(tools.map((tool) => [tool.id, tool]));

function toToolSearchDocument(tool: ToolCatalogItem, isFavorite: boolean): SearchDocument {
  return {
    id: tool.id,
    group: 'tools',
    title: tool.title,
    subtitle: tool.description,
    href: tool.href,
    keywords: [tool.id, tool.collectionId, ...tool.tags, ...(isFavorite ? ['favorite'] : [])],
  };
}

function toRecentSearchDocument(recent: RecentTool): SearchDocument {
  return {
    id: `recent:${recent.toolId}`,
    group: 'recents',
    title: recent.title,
    subtitle: recent.toolId,
    href: recent.href,
    keywords: [recent.toolId],
    updatedAt: recent.updatedAt,
  };
}

function toCardSearchDocument(card: CardResult): SearchDocument {
  return {
    id: `card:${card.id}`,
    group: 'cards',
    title: card.title,
    subtitle: card.toolId,
    href: card.href,
    keywords: [card.toolId],
    updatedAt: card.updatedAt,
  };
}

export function CommandPalette() {
  const { isOpen, setIsOpen } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [favoriteToolIds, setFavoriteToolIds] = useState<Set<string>>(new Set());
  const [recentTools, setRecentTools] = useState<RecentTool[]>([]);
  const [cards, setCards] = useState<CardResult[]>([]);

  async function loadLocalSources() {
    if (isLoading || hasLoaded) {
      return;
    }

    setIsLoading(true);

    try {
      const [favorites, recents, savedCards] = await Promise.all([
        listFavoriteToolIds(),
        listRecents(20),
        listToolCards(40),
      ]);

      const normalizedRecents: RecentTool[] = recents
        .map((recent) => {
          const tool = toolById.get(recent.toolId);

          if (!tool) {
            return undefined;
          }

          return {
            toolId: tool.id,
            title: tool.title,
            href: tool.href,
            updatedAt: recent.lastUsedAt,
          };
        })
        .filter((entry): entry is RecentTool => Boolean(entry));

      const normalizedCards: CardResult[] = savedCards.map((card) => ({
        id: card.id,
        title: card.title,
        toolId: card.toolId,
        href:
          typeof card.payload[SAVED_CARD_HREF_KEY] === 'string' &&
          card.payload[SAVED_CARD_HREF_KEY].startsWith('/t/')
            ? card.payload[SAVED_CARD_HREF_KEY]
            : `/t/${card.toolId}`,
        updatedAt: card.updatedAt,
      }));

      setFavoriteToolIds(new Set(favorites));
      setRecentTools(normalizedRecents);
      setCards(normalizedCards);
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }

  function closePalette() {
    setIsOpen(false);
    setQuery('');
  }

  function shouldIgnoreShortcutTarget(target: globalThis.EventTarget | null) {
    if (!(target instanceof globalThis.HTMLElement)) {
      return false;
    }

    const tagName = target.tagName.toLowerCase();
    return (
      target.isContentEditable ||
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      Boolean(target.closest('[contenteditable="true"]'))
    );
  }

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();

        if (isOpen) {
          closePalette();
          return;
        }

        setIsOpen(true);
        void loadLocalSources();
      }

      if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !shouldIgnoreShortcutTarget(event.target)
      ) {
        event.preventDefault();
        setIsOpen(true);
        void loadLocalSources();
      }

      if (event.key === 'Escape' && isOpen) {
        closePalette();
      }
    }

    globalThis.addEventListener('keydown', onKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', onKeyDown);
    };
  }, [closePalette, hasLoaded, isLoading, isOpen, loadLocalSources, setIsOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void loadLocalSources();
  }, [isOpen, loadLocalSources]);

  const toolResults = searchDocuments(
    tools.map((tool) => toToolSearchDocument(tool, favoriteToolIds.has(tool.id))),
    query,
    { limit: 8 },
  );
  const recentResults = searchDocuments(
    recentTools.map((recent) => toRecentSearchDocument(recent)),
    query,
    { limit: 6 },
  );
  const cardResults = searchDocuments(
    cards.map((card) => toCardSearchDocument(card)),
    query,
    { limit: 6 },
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-background/70 p-4 pt-20 backdrop-blur-sm"
      role="presentation"
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="flex items-center border-b border-border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Search tools, recents, and saved cards..."
            className="h-9 w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={closePalette}
            className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Esc
          </button>
        </div>

        <div className="max-h-[65vh] overflow-auto p-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading local results...</p>
          ) : null}

          <ResultGroup
            title="Tools"
            emptyLabel="No matching tools."
            results={toolResults}
            onSelect={closePalette}
          />
          <ResultGroup
            title="Recents"
            emptyLabel="No recent matches."
            results={recentResults}
            onSelect={closePalette}
          />
          <ResultGroup
            title="Cards"
            emptyLabel="No saved card matches."
            results={cardResults}
            onSelect={closePalette}
          />
        </div>
      </div>
    </div>
  );
}

type ResultGroupProps = {
  title: string;
  emptyLabel: string;
  results: SearchDocument[];
  onSelect: () => void;
};

function ResultGroup({ title, emptyLabel, results, onSelect }: ResultGroupProps) {
  return (
    <section className="mb-5 last:mb-0">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {results.length ? (
        <ul className="space-y-1">
          {results.map((result) => (
            <li key={result.id}>
              {result.href ? (
                <Link
                  href={result.href}
                  onClick={onSelect}
                  className="block rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground"
                >
                  <p className="text-sm font-medium leading-tight">{result.title}</p>
                  {result.subtitle ? (
                    <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                  ) : null}
                </Link>
              ) : (
                <div className="rounded-md px-2 py-2">
                  <p className="text-sm font-medium leading-tight">{result.title}</p>
                  {result.subtitle ? (
                    <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-border/80 px-2 py-2 text-xs text-muted-foreground">
          {emptyLabel}
        </p>
      )}
    </section>
  );
}

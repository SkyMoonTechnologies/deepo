'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useCommandPalette } from '@/components/search/useCommandPalette';
import { listToolCards, SAVED_CARD_HREF_KEY } from '@/lib/client-db';
import { tools } from '@/lib/catalog';

type SavedCard = {
  id: string;
  toolId: string;
  title: string;
  updatedAt: string;
  href: string;
};

const toolById = new Map(tools.map((tool) => [tool.id, tool]));

function formatDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }

  return parsed.toLocaleString();
}

export function SavedCardsClient() {
  const { topbarQuery } = useCommandPalette();
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<SavedCard[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadCards() {
      try {
        const storedCards = await listToolCards(200);

        if (!mounted) {
          return;
        }

        setCards(
          storedCards.map((card) => ({
            id: card.id,
            toolId: card.toolId,
            title: card.title,
            updatedAt: card.updatedAt,
            href:
              typeof card.payload[SAVED_CARD_HREF_KEY] === 'string' &&
              card.payload[SAVED_CARD_HREF_KEY].startsWith('/t/')
                ? card.payload[SAVED_CARD_HREF_KEY]
                : `/t/${card.toolId}`,
          })),
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCards();

    return () => {
      mounted = false;
    };
  }, []);

  const query = topbarQuery.trim().toLowerCase();
  const filteredCards = query
    ? cards.filter((card) => {
        const tool = toolById.get(card.toolId);
        return (
          card.title.toLowerCase().includes(query) ||
          card.toolId.toLowerCase().includes(query) ||
          tool?.title.toLowerCase().includes(query)
        );
      })
    : cards;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Saved Cards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cards are stored in this browser and grouped by tool.
        </p>
      </section>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading saved cards...</p> : null}

      {!isLoading && filteredCards.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/80 px-3 py-3 text-sm text-muted-foreground">
          No saved cards yet.
        </p>
      ) : null}

      {filteredCards.length > 0 ? (
        <ul className="space-y-2">
          {filteredCards.map((card) => {
            const tool = toolById.get(card.toolId);

            return (
              <li
                key={card.id}
                className="rounded-lg border border-border/70 bg-card/40 px-3 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{card.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tool?.title ?? card.toolId} • Updated {formatDate(card.updatedAt)}
                    </p>
                  </div>
                  <Link
                    href={card.href}
                    className="rounded-md border border-input px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
                  >
                    Open tool
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

import { Card, CardContent } from '@/components/ui/card';

type StatsRowProps = {
  title: string;
  visibleCount: number;
  totalCount: number;
  favoriteCount?: number;
  recentCount?: number;
};

const numberFormat = new Intl.NumberFormat('en-US');

export function StatsRow({ title, visibleCount, totalCount, favoriteCount = 0, recentCount = 0 }: StatsRowProps) {
  const stats = [
    { label: 'Visible', value: numberFormat.format(visibleCount), note: `In ${title}` },
    { label: 'Total Tools', value: numberFormat.format(totalCount), note: 'Catalog entries' },
    { label: 'Favorites', value: numberFormat.format(favoriteCount), note: 'Saved locally' },
    { label: 'Recents', value: numberFormat.format(recentCount), note: 'Tracked locally' },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <Card key={item.label} className="border-border/70">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

type StatCardItem = {
  label: string;
  value: string;
  note?: string;
};

type StatCardsProps = {
  items: StatCardItem[];
};

export function StatCards({ items }: StatCardsProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <li
          key={item.label}
          className="rounded-xl border border-border/80 bg-card/95 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.6)]"
        >
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
          {item.note ? <p className="mt-1 text-xs text-muted-foreground">{item.note}</p> : null}
        </li>
      ))}
    </ul>
  );
}

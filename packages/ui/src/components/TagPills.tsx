type TagPillsProps = {
  tags: string[];
};

export function TagPills({ tags }: TagPillsProps) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-border/80 bg-secondary/70 px-2 py-1 text-xs font-medium text-secondary-foreground"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

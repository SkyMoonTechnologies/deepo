export type CollectionId = 'build' | 'ship' | 'design' | 'operate' | 'write';

export type LucideIconName =
  | 'Braces'
  | 'ShieldCheck'
  | 'Binary'
  | 'Hash'
  | 'ScanSearch'
  | 'Clock3'
  | 'CalendarClock'
  | 'Fingerprint'
  | 'Leaf'
  | 'FileCode2'
  | 'GitCompareArrows'
  | 'SplitSquareVertical'
  | 'BadgeCheck'
  | 'Palette'
  | 'Type'
  | 'Image'
  | 'Link2'
  | 'LineChart'
  | 'ReceiptText'
  | 'FileText'
  | 'ScrollText'
  | 'NotebookPen'
  | 'ClipboardList'
  | 'Megaphone'
  | 'BookOpenText';

export type Collection = {
  id: CollectionId;
  name: string;
  description: string;
};

export type ToolCatalogItem = {
  id: string;
  title: string;
  description: string;
  href: `/t/${string}`;
  collectionId: CollectionId;
  tags: string[];
  icon: LucideIconName;
};

export const collections: Collection[] = [
  { id: 'build', name: 'Build', description: 'Developer-focused diagnostics and transforms.' },
  { id: 'ship', name: 'Ship', description: 'Go-to-market, delivery, and planning helpers.' },
  { id: 'design', name: 'Design', description: 'Color, typography, and presentation utilities.' },
  { id: 'operate', name: 'Operate', description: 'Time, automation, and day-to-day operations.' },
  { id: 'write', name: 'Write', description: 'Structured docs and communication templates.' },
];

export const tools: ToolCatalogItem[] = [
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Validate, pretty print, and inspect JSON trees.',
    href: '/t/json-formatter',
    collectionId: 'build',
    tags: ['JSON', 'Validation', 'Transform'],
    icon: 'Braces',
  },
  {
    id: 'text-diff',
    title: 'Text Diff',
    description: 'Compare text blocks with line-level insights.',
    href: '/t/text-diff',
    collectionId: 'build',
    tags: ['Diff', 'Review', 'Text'],
    icon: 'GitCompareArrows',
  },
  {
    id: 'json-semantic-diff',
    title: 'JSON Semantic Diff',
    description: 'Compare structured JSON while ignoring noise.',
    href: '/t/json-semantic-diff',
    collectionId: 'build',
    tags: ['JSON', 'Diff', 'Review'],
    icon: 'SplitSquareVertical',
  },
  {
    id: 'markdown-preview',
    title: 'Markdown Preview',
    description: 'Preview and normalize markdown snippets.',
    href: '/t/markdown-preview',
    collectionId: 'write',
    tags: ['Markdown', 'Docs', 'Text'],
    icon: 'FileCode2',
  },
  {
    id: 'jwt',
    title: 'JWT Decoder',
    description: 'Decode token headers and claims safely.',
    href: '/t/jwt',
    collectionId: 'build',
    tags: ['Security', 'Token', 'Inspect'],
    icon: 'ShieldCheck',
  },
  {
    id: 'encoders',
    title: 'Encoders',
    description: 'Encode and decode Base64, URL, and HTML entities.',
    href: '/t/encoders',
    collectionId: 'build',
    tags: ['Encoding', 'Text', 'Utility'],
    icon: 'Binary',
  },
  {
    id: 'hash-hmac',
    title: 'Hash and HMAC',
    description: 'Create hashes and signatures for payload checks.',
    href: '/t/hash-hmac',
    collectionId: 'build',
    tags: ['Crypto', 'Integrity', 'Security'],
    icon: 'Hash',
  },
  {
    id: 'regex',
    title: 'Regex Tester',
    description: 'Iterate patterns, flags, and match groups quickly.',
    href: '/t/regex',
    collectionId: 'build',
    tags: ['Regex', 'Debug', 'Text'],
    icon: 'ScanSearch',
  },
  {
    id: 'timestamp',
    title: 'Timestamp Converter',
    description: 'Convert between Unix, ISO, and relative time.',
    href: '/t/timestamp',
    collectionId: 'operate',
    tags: ['Time', 'Date', 'Convert'],
    icon: 'Clock3',
  },
  {
    id: 'cron',
    title: 'Cron Helper',
    description: 'Build and explain cron schedules.',
    href: '/t/cron',
    collectionId: 'operate',
    tags: ['Schedule', 'Automation', 'Ops'],
    icon: 'CalendarClock',
  },
  {
    id: 'uuid-ulid',
    title: 'UUID and ULID',
    description: 'Generate and inspect deterministic identifiers.',
    href: '/t/uuid-ulid',
    collectionId: 'build',
    tags: ['Identifier', 'Data', 'Utility'],
    icon: 'Fingerprint',
  },
  {
    id: 'env-helper',
    title: 'ENV Helper',
    description: 'Parse and validate environment variable payloads.',
    href: '/t/env-helper',
    collectionId: 'operate',
    tags: ['Config', 'Environment', 'Safety'],
    icon: 'Leaf',
  },
  {
    id: 'contrast',
    title: 'Contrast Checker',
    description: 'Measure WCAG contrast and readability quickly.',
    href: '/t/contrast',
    collectionId: 'design',
    tags: ['Accessibility', 'WCAG', 'Color'],
    icon: 'BadgeCheck',
  },
  {
    id: 'color',
    title: 'Color Palette',
    description: 'Generate tonal ramps and color scales.',
    href: '/t/color',
    collectionId: 'design',
    tags: ['Color', 'Theme', 'Design'],
    icon: 'Palette',
  },
  {
    id: 'typography',
    title: 'Typography Scale',
    description: 'Create type scales and spacing rhythm.',
    href: '/t/typography',
    collectionId: 'design',
    tags: ['Typography', 'Design', 'Scale'],
    icon: 'Type',
  },
  {
    id: 'image-optimize',
    title: 'Image Optimize',
    description: 'Resize and compress images for web delivery.',
    href: '/t/image-optimize',
    collectionId: 'design',
    tags: ['Image', 'Compression', 'Performance'],
    icon: 'Image',
  },
  {
    id: 'utm',
    title: 'UTM Builder',
    description: 'Build clean campaign links with full tracking tags.',
    href: '/t/utm',
    collectionId: 'ship',
    tags: ['Marketing', 'Attribution', 'Links'],
    icon: 'Link2',
  },
  {
    id: 'unit-econ',
    title: 'Unit Economics',
    description: 'Compute CAC, LTV, and margin assumptions.',
    href: '/t/unit-econ',
    collectionId: 'ship',
    tags: ['Finance', 'Growth', 'Modeling'],
    icon: 'LineChart',
  },
  {
    id: 'invoice-quote',
    title: 'Invoice and Quote',
    description: 'Generate printable invoice and quote documents.',
    href: '/t/invoice-quote',
    collectionId: 'ship',
    tags: ['Billing', 'PDF', 'Operations'],
    icon: 'ReceiptText',
  },
  {
    id: 'weekly-status',
    title: 'Weekly Status',
    description: 'Summarize progress, blockers, and next steps.',
    href: '/t/weekly-status',
    collectionId: 'write',
    tags: ['Status', 'Reporting', 'Template'],
    icon: 'ClipboardList',
  },
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'Record attendees, decisions, and action items.',
    href: '/t/meeting-notes',
    collectionId: 'write',
    tags: ['Meetings', 'Notes', 'Template'],
    icon: 'NotebookPen',
  },
  {
    id: 'prd',
    title: 'PRD Template',
    description: 'Draft product requirements with consistent sections.',
    href: '/t/prd',
    collectionId: 'write',
    tags: ['Product', 'Planning', 'Template'],
    icon: 'FileText',
  },
  {
    id: 'adr',
    title: 'ADR Template',
    description: 'Capture architecture decisions and tradeoffs.',
    href: '/t/adr',
    collectionId: 'write',
    tags: ['Architecture', 'Decision', 'Template'],
    icon: 'ScrollText',
  },
  {
    id: 'release-notes',
    title: 'Release Notes',
    description: 'Draft customer-facing release notes quickly.',
    href: '/t/release-notes',
    collectionId: 'ship',
    tags: ['Release', 'Comms', 'Template'],
    icon: 'Megaphone',
  },
];

export const collectionById = new Map(collections.map((collection) => [collection.id, collection]));

export const toolsByCollectionId = collections.reduce<Record<CollectionId, ToolCatalogItem[]>>(
  (acc, collection) => {
    acc[collection.id] = tools.filter((tool) => tool.collectionId === collection.id);
    return acc;
  },
  {
    build: [],
    ship: [],
    design: [],
    operate: [],
    write: [],
  },
);

export const tagCounts = tools.reduce<Record<string, number>>((acc, tool) => {
  for (const tag of tool.tags) {
    acc[tag] = (acc[tag] ?? 0) + 1;
  }
  return acc;
}, {});

export const tags = Object.entries(tagCounts)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => a.name.localeCompare(b.name));

'use client';

import { useState } from 'react';

type JsonTreeProps = {
  value: unknown;
  onSelectPath?: (path: string) => void;
};

type NodeMeta = {
  path: string;
  label: string;
  value: unknown;
  depth: number;
};

const BRACKET_KEY_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isExpandable(value: unknown): boolean {
  return Array.isArray(value) || isObjectRecord(value);
}

function pathSegment(parentPath: string, key: string | number): string {
  if (typeof key === 'number') {
    return `${parentPath}[${key}]`;
  }

  if (BRACKET_KEY_PATTERN.test(key)) {
    return `${parentPath}.${key}`;
  }

  return `${parentPath}[${JSON.stringify(key)}]`;
}

function valueLabel(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  return `Object(${Object.keys(value as Record<string, unknown>).length})`;
}

function createChildren(meta: NodeMeta): NodeMeta[] {
  if (Array.isArray(meta.value)) {
    return meta.value.map((entry, index) => ({
      path: pathSegment(meta.path, index),
      label: `[${index}]`,
      value: entry,
      depth: meta.depth + 1,
    }));
  }

  if (isObjectRecord(meta.value)) {
    return Object.entries(meta.value).map(([key, entryValue]) => ({
      path: pathSegment(meta.path, key),
      label: key,
      value: entryValue,
      depth: meta.depth + 1,
    }));
  }

  return [];
}

export function JsonTree({ value, onSelectPath }: JsonTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => new Set(['$']));
  const [selectedPath, setSelectedPath] = useState('$');

  const togglePath = (path: string) => {
    const nextExpanded = new Set(expandedPaths);
    if (nextExpanded.has(path)) {
      nextExpanded.delete(path);
    } else {
      nextExpanded.add(path);
    }
    setExpandedPaths(nextExpanded);
  };

  const selectPath = (path: string) => {
    setSelectedPath(path);
    onSelectPath?.(path);
  };

  const renderNode = (meta: NodeMeta) => {
    const expandable = isExpandable(meta.value);
    const expanded = expandedPaths.has(meta.path);
    const children = expanded && expandable ? createChildren(meta) : [];

    return (
      <li key={meta.path} className="space-y-1" role="none">
        <div
          className="flex min-h-8 items-center gap-1 rounded-md"
          role="treeitem"
          aria-level={meta.depth + 1}
          aria-expanded={expandable ? expanded : undefined}
          aria-selected={selectedPath === meta.path}
          style={{ paddingLeft: `${meta.depth * 14}px` }}
        >
          {expandable ? (
            <button
              type="button"
              className="h-7 w-7 rounded border border-border/70 text-xs"
              onClick={() => togglePath(meta.path)}
              aria-label={expanded ? `Collapse ${meta.label}` : `Expand ${meta.label}`}
            >
              {expanded ? '−' : '+'}
            </button>
          ) : (
            <span className="inline-block h-7 w-7" />
          )}
          <button
            type="button"
            className={`rounded px-2 py-1 text-left text-sm ${selectedPath === meta.path ? 'bg-accent text-accent-foreground' : ''}`}
            onClick={() => selectPath(meta.path)}
          >
            <span className="font-medium">{meta.label}</span>
            <span className="text-muted-foreground">: {valueLabel(meta.value)}</span>
          </button>
        </div>
        {children.length > 0 ? <ul role="group">{children.map((child) => renderNode(child))}</ul> : null}
      </li>
    );
  };

  return (
    <div aria-label="JSON tree" role="tree" className="max-h-[28rem] overflow-auto rounded-lg border border-border/70 p-2">
      <ul role="none">{renderNode({ path: '$', label: '$', value, depth: 0 })}</ul>
    </div>
  );
}

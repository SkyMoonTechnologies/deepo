'use client';

import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';

export type ViewMode = 'grid' | 'list';
export type SortMode = 'recent' | 'name-asc' | 'name-desc' | 'collection' | 'favorites-first';
export type FilterMode = 'all' | 'favorites' | 'recents' | 'build' | 'ship' | 'design' | 'operate' | 'write';

const FILTER_MODE_STORAGE_KEY = 'deepo.filter-mode';
const SORT_MODE_STORAGE_KEY = 'deepo.sort-mode';
const VIEW_MODE_STORAGE_KEY = 'deepo.view-mode';
const VALID_FILTER_MODES: FilterMode[] = ['all', 'favorites', 'recents', 'build', 'ship', 'design', 'operate', 'write'];
const VALID_SORT_MODES: SortMode[] = ['recent', 'name-asc', 'name-desc', 'collection', 'favorites-first'];
const VALID_VIEW_MODES: ViewMode[] = ['grid', 'list'];

function isFilterMode(value: string): value is FilterMode {
  return VALID_FILTER_MODES.includes(value as FilterMode);
}

function isSortMode(value: string): value is SortMode {
  return VALID_SORT_MODES.includes(value as SortMode);
}

function isViewMode(value: string): value is ViewMode {
  return VALID_VIEW_MODES.includes(value as ViewMode);
}

type CommandPaletteContextValue = {
  topbarQuery: string;
  setTopbarQuery: (query: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

type CommandPaletteProviderProps = {
  children: ReactNode;
};

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const [topbarQuery, setTopbarQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [filterMode, setFilterModeState] = useState<FilterMode>('all');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const storedFilter = globalThis.window.localStorage.getItem(FILTER_MODE_STORAGE_KEY);
      if (storedFilter && isFilterMode(storedFilter)) {
        setFilterModeState(storedFilter);
      }

      const storedSort = globalThis.window.localStorage.getItem(SORT_MODE_STORAGE_KEY);
      if (storedSort && isSortMode(storedSort)) {
        setSortMode(storedSort);
      }

      const storedView = globalThis.window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (storedView && isViewMode(storedView)) {
        setViewMode(storedView);
      }
    } catch {
      // Ignore storage errors and keep defaults.
    }
  }, []);

  function setPersistedSortMode(mode: SortMode) {
    setSortMode(mode);
    try {
      globalThis.window.localStorage.setItem(SORT_MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors.
    }
  }

  function setPersistedViewMode(mode: ViewMode) {
    setViewMode(mode);
    try {
      globalThis.window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors.
    }
  }

  function setFilterMode(mode: FilterMode) {
    setFilterModeState(mode);
    try {
      globalThis.window.localStorage.setItem(FILTER_MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors.
    }
  }

  return createElement(
    CommandPaletteContext.Provider,
    {
      value: {
        topbarQuery,
        setTopbarQuery,
        viewMode,
        setViewMode: setPersistedViewMode,
        sortMode,
        setSortMode: setPersistedSortMode,
        filterMode,
        setFilterMode,
        isOpen,
        setIsOpen,
      },
    },
    children,
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);

  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }

  return context;
}

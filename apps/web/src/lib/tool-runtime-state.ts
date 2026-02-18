'use client';

import { useSyncExternalStore } from 'react';

const store = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

const subscribe = (key: string, listener: () => void): (() => void) => {
  const bucket = listeners.get(key) ?? new Set<() => void>();
  bucket.add(listener);
  listeners.set(key, bucket);

  return () => {
    const current = listeners.get(key);
    current?.delete(listener);
    if (current && current.size === 0) {
      listeners.delete(key);
    }
  };
};

const emit = (key: string) => {
  const bucket = listeners.get(key);
  if (!bucket) {
    return;
  }

  for (const listener of bucket) {
    listener();
  }
};

export const setToolRuntimeState = <T,>(key: string, nextValue: T) => {
  store.set(key, nextValue);
  emit(key);
};

export const getToolRuntimeState = <T,>(key: string, initialState: T): T => {
  if (!store.has(key)) {
    store.set(key, initialState);
  }

  return (store.get(key) as T) ?? initialState;
};

export const useToolRuntimeState = <T,>(key: string, initialState: T): [T, (nextValue: T) => void] => {
  const snapshot = useSyncExternalStore(
    (onStoreChange) => subscribe(key, onStoreChange),
    () => getToolRuntimeState(key, initialState),
    () => initialState,
  );

  const setSnapshot = (nextValue: T) => {
    setToolRuntimeState(key, nextValue);
  };

  return [snapshot, setSnapshot];
};

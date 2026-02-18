export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export type AnalyticsAdapter = {
  track: (eventName: string, properties?: AnalyticsProperties) => void;
  page: (path: string, properties?: AnalyticsProperties) => void;
  identify: (userId: string, properties?: AnalyticsProperties) => void;
};

const noopAdapter: AnalyticsAdapter = {
  track: () => {},
  page: () => {},
  identify: () => {},
};

let activeAdapter: AnalyticsAdapter = noopAdapter;

export function setAnalyticsAdapter(adapter: Partial<AnalyticsAdapter> | null | undefined): void {
  if (!adapter) {
    activeAdapter = noopAdapter;
    return;
  }

  activeAdapter = {
    track: adapter.track ?? noopAdapter.track,
    page: adapter.page ?? noopAdapter.page,
    identify: adapter.identify ?? noopAdapter.identify,
  };
}

export function resetAnalyticsAdapter(): void {
  activeAdapter = noopAdapter;
}

export function track(eventName: string, properties?: AnalyticsProperties): void {
  activeAdapter.track(eventName, properties);
}

export function page(path: string, properties?: AnalyticsProperties): void {
  activeAdapter.page(path, properties);
}

export function identify(userId: string, properties?: AnalyticsProperties): void {
  activeAdapter.identify(userId, properties);
}

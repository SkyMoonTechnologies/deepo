'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { runScenario, type ScenarioMode, type UnitEconomicsInput } from '@deepo/tools-core';

import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';

type ToolClientProps = {
  panel: ToolPanel;
};

const readNumber = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readState = (params: globalThis.URLSearchParams): UnitEconomicsInput & { mode: ScenarioMode } => {
  const mode = params.get('mode');
  return {
    startingCash: readNumber(params.get('cash'), 250000),
    monthlyRevenue: readNumber(params.get('rev'), 80000),
    monthlyCosts: readNumber(params.get('cost'), 110000),
    newCustomersPerMonth: readNumber(params.get('customers'), 40),
    marketingSpend: readNumber(params.get('mkt'), 30000),
    arpu: readNumber(params.get('arpu'), 250),
    grossMarginRate: readNumber(params.get('gm'), 0.75),
    monthlyChurnRate: readNumber(params.get('churn'), 0.05),
    mode: mode === 'best' || mode === 'base' || mode === 'worst' ? mode : 'base',
  };
};

const formatNumber = (value: number, kind: 'money' | 'ratio' | 'plain' = 'plain') => {
  if (!Number.isFinite(value)) {
    return 'Infinity';
  }

  if (kind === 'money') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  if (kind === 'ratio') {
    return `${(value * 100).toFixed(1)}%`;
  }

  return value.toFixed(2);
};

export default function ToolClient({ panel }: ToolClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readState(new globalThis.URLSearchParams(searchParams.toString()));

  const setParam = (key: string, value: string) => {
    const next = new globalThis.URLSearchParams(searchParams.toString());
    if (value.length > 0) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    const query = next.toString();
    router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  if (panel === 'input') {
    const fields: Array<[string, string, number | string]> = [
      ['cash', 'Starting cash', state.startingCash],
      ['rev', 'Monthly revenue', state.monthlyRevenue],
      ['cost', 'Monthly costs', state.monthlyCosts],
      ['customers', 'New customers / month', state.newCustomersPerMonth],
      ['mkt', 'Marketing spend / month', state.marketingSpend],
      ['arpu', 'ARPU', state.arpu],
      ['gm', 'Gross margin rate (0-1)', state.grossMarginRate],
      ['churn', 'Monthly churn (0-1)', state.monthlyChurnRate],
    ];

    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Inputs</h2>
        <label className="block space-y-1 text-sm">
          <span>Scenario</span>
          <select
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
            value={state.mode}
            onChange={(event) => setParam('mode', event.target.value)}
          >
            <option value="best">Best</option>
            <option value="base">Base</option>
            <option value="worst">Worst</option>
          </select>
        </label>
        {fields.map(([key, label, value]) => (
          <label key={key} className="block space-y-1 text-sm">
            <span>{label}</span>
            <input
              type="number"
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={value}
              onChange={(event) => setParam(key, event.target.value)}
            />
          </label>
        ))}
      </div>
    );
  }

  const result = runScenario(state, state.mode);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Metrics ({state.mode})</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-border/70 p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Burn</p>
          <p className="text-lg font-semibold">{formatNumber(result.burn, 'money')}</p>
        </div>
        <div className="rounded-md border border-border/70 p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Runway</p>
          <p className="text-lg font-semibold">{formatNumber(result.runwayMonths)} months</p>
        </div>
        <div className="rounded-md border border-border/70 p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">CAC</p>
          <p className="text-lg font-semibold">{formatNumber(result.cac, 'money')}</p>
        </div>
        <div className="rounded-md border border-border/70 p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">LTV</p>
          <p className="text-lg font-semibold">{formatNumber(result.ltv, 'money')}</p>
        </div>
        <div className="rounded-md border border-border/70 p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">LTV/CAC</p>
          <p className="text-lg font-semibold">{formatNumber(result.ltvCac)}</p>
        </div>
        <div className="rounded-md border border-border/70 p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Margin</p>
          <p className="text-lg font-semibold">{formatNumber(result.contributionMargin, 'ratio')}</p>
        </div>
      </div>
    </div>
  );
}

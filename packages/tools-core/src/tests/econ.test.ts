import { describe, expect, it } from 'vitest';

import { calculateUnitEconomics, runScenario } from '../econ';

describe('unit economics', () => {
  const input = {
    startingCash: 120000,
    monthlyRevenue: 40000,
    monthlyCosts: 70000,
    newCustomersPerMonth: 20,
    marketingSpend: 20000,
    arpu: 500,
    grossMarginRate: 0.8,
    monthlyChurnRate: 0.05,
  };

  it('calculates runway burn cac and ltv', () => {
    const result = calculateUnitEconomics(input);

    expect(result.burn).toBe(30000);
    expect(result.runwayMonths).toBe(4);
    expect(result.cac).toBe(1000);
    expect(result.ltv).toBe(8000);
  });

  it('applies scenario toggles', () => {
    const best = runScenario(input, 'best');
    const worst = runScenario(input, 'worst');

    expect(best.burn).toBeLessThan(worst.burn);
  });
});

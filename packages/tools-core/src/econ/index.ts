export type ScenarioMode = 'best' | 'base' | 'worst';

export type UnitEconomicsInput = {
  startingCash: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  newCustomersPerMonth: number;
  marketingSpend: number;
  arpu: number;
  grossMarginRate: number;
  monthlyChurnRate: number;
};

export type UnitEconomicsResult = {
  burn: number;
  runwayMonths: number;
  cac: number;
  ltv: number;
  ltvCac: number;
  contributionMargin: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const finite = (value: number) => (Number.isFinite(value) ? value : Number.POSITIVE_INFINITY);

export const calculateUnitEconomics = (input: UnitEconomicsInput): UnitEconomicsResult => {
  const burn = input.monthlyCosts - input.monthlyRevenue;
  const runwayMonths = burn > 0 ? input.startingCash / burn : Number.POSITIVE_INFINITY;

  const cac = input.newCustomersPerMonth > 0 ? input.marketingSpend / input.newCustomersPerMonth : Number.POSITIVE_INFINITY;

  const churn = clamp(input.monthlyChurnRate, 0.0001, 1);
  const ltv = (input.arpu * clamp(input.grossMarginRate, 0, 1)) / churn;

  const contributionMargin = input.monthlyRevenue > 0 ? (input.monthlyRevenue - input.monthlyCosts) / input.monthlyRevenue : 0;

  return {
    burn,
    runwayMonths: finite(runwayMonths),
    cac: finite(cac),
    ltv,
    ltvCac: cac > 0 ? ltv / cac : Number.POSITIVE_INFINITY,
    contributionMargin,
  };
};

export const runScenario = (input: UnitEconomicsInput, mode: ScenarioMode): UnitEconomicsResult => {
  if (mode === 'base') {
    return calculateUnitEconomics(input);
  }

  if (mode === 'best') {
    return calculateUnitEconomics({
      ...input,
      monthlyRevenue: input.monthlyRevenue * 1.2,
      monthlyCosts: input.monthlyCosts * 0.9,
      newCustomersPerMonth: input.newCustomersPerMonth * 1.15,
      monthlyChurnRate: input.monthlyChurnRate * 0.85,
      grossMarginRate: clamp(input.grossMarginRate * 1.05, 0, 1),
    });
  }

  return calculateUnitEconomics({
    ...input,
    monthlyRevenue: input.monthlyRevenue * 0.85,
    monthlyCosts: input.monthlyCosts * 1.1,
    newCustomersPerMonth: input.newCustomersPerMonth * 0.8,
    monthlyChurnRate: clamp(input.monthlyChurnRate * 1.2, 0, 1),
    grossMarginRate: clamp(input.grossMarginRate * 0.9, 0, 1),
  });
};

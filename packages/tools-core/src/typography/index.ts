export const typographyScalePresets = {
  'minor-second': 1.067,
  majorSecond: 1.125,
  minorThird: 1.2,
  majorThird: 1.25,
  perfectFourth: 1.333,
  augmentedFourth: 1.414,
  perfectFifth: 1.5,
  goldenRatio: 1.618,
} as const;

export type TypographyScalePreset = keyof typeof typographyScalePresets;

export type ClampInput = {
  minSizePx: number;
  maxSizePx: number;
  minViewportPx: number;
  maxViewportPx: number;
};

const round = (value: number, digits = 4) => Number(value.toFixed(digits));

export const generateTypeScale = (baseSizePx: number, ratio: number, steps: number): number[] => {
  const result: number[] = [];

  for (let step = 0; step <= steps; step += 1) {
    result.push(round(baseSizePx * ratio ** step, 3));
  }

  return result;
};

export const generateClamp = (input: ClampInput): string => {
  const minSizeRem = input.minSizePx / 16;
  const maxSizeRem = input.maxSizePx / 16;
  const slope = (input.maxSizePx - input.minSizePx) / (input.maxViewportPx - input.minViewportPx);
  const interceptPx = input.minSizePx - slope * input.minViewportPx;
  const interceptRem = interceptPx / 16;
  const slopeVw = slope * 100;

  return `clamp(${round(minSizeRem)}rem, ${round(interceptRem)}rem + ${round(slopeVw)}vw, ${round(maxSizeRem)}rem)`;
};

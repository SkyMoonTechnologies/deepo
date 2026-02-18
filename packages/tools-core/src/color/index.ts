import { converter, formatHex, parse } from 'culori';

export type HarmonyMode = 'analogous' | 'complementary' | 'triad';

export type ConvertedColor = {
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
};

const toRgb = converter('rgb');
const toHsl = converter('hsl');
const toOklch = converter('oklch');

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const formatNumber = (value: number, digits = 3) => Number(value.toFixed(digits));

const normalizeHue = (value: number) => ((value % 360) + 360) % 360;

export const convertColor = (input: string): ConvertedColor | null => {
  const parsed = parse(input);
  if (!parsed) {
    return null;
  }

  const rgb = toRgb(parsed);
  const hsl = toHsl(parsed);
  const oklch = toOklch(parsed);

  if (!rgb || !hsl || !oklch || rgb.r === undefined || rgb.g === undefined || rgb.b === undefined) {
    return null;
  }

  const hex = formatHex(parsed);
  const rgbText = `rgb(${Math.round(clamp(rgb.r, 0, 1) * 255)} ${Math.round(clamp(rgb.g, 0, 1) * 255)} ${Math.round(
    clamp(rgb.b, 0, 1) * 255,
  )})`;
  const hslText = `hsl(${formatNumber(hsl.h ?? 0, 1)} ${formatNumber((hsl.s ?? 0) * 100, 1)}% ${formatNumber((hsl.l ?? 0) * 100, 1)}%)`;
  const oklchText = `oklch(${formatNumber(oklch.l ?? 0)} ${formatNumber(oklch.c ?? 0)} ${formatNumber(oklch.h ?? 0, 1)})`;

  return {
    hex,
    rgb: rgbText,
    hsl: hslText,
    oklch: oklchText,
  };
};

export const buildHarmonyPalette = (input: string, mode: HarmonyMode): string[] => {
  const parsed = parse(input);
  if (!parsed) {
    return [];
  }

  const oklch = toOklch(parsed);
  if (!oklch) {
    return [];
  }

  const baseHue = oklch.h ?? 0;
  const offsets: number[] =
    mode === 'analogous' ? [-30, 0, 30] : mode === 'complementary' ? [0, 180] : [0, 120, 240];

  const palette = offsets.map((offset) =>
    formatHex({
      mode: 'oklch',
      l: clamp(oklch.l ?? 0.65, 0, 1),
      c: clamp(oklch.c ?? 0.12, 0, 0.37),
      h: normalizeHue(baseHue + offset),
    }),
  );

  return [...new Set(palette)];
};

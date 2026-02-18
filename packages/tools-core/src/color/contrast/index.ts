import { converter, formatHex, parse } from 'culori';

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export type WcagRating = {
  normalAA: boolean;
  normalAAA: boolean;
  largeAA: boolean;
  largeAAA: boolean;
};

export type ContrastReport = {
  ratio: number;
  wcag: WcagRating;
};

export type ContrastSuggestion = {
  label: string;
  color: string;
  ratio: number;
};

const toRgb = converter('rgb');
const toHsl = converter('hsl');

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const normalize = (value: number): number => {
  if (value <= 0.03928) {
    return value / 12.92;
  }

  return ((value + 0.055) / 1.055) ** 2.4;
};

export const parseColorToRgb = (input: string): RgbColor | null => {
  const parsed = parse(input);
  if (!parsed) {
    return null;
  }

  const rgb = toRgb(parsed);
  if (!rgb || rgb.r === undefined || rgb.g === undefined || rgb.b === undefined) {
    return null;
  }

  return {
    r: clamp01(rgb.r),
    g: clamp01(rgb.g),
    b: clamp01(rgb.b),
  };
};

export const contrastRatio = (foreground: string, background: string): number | null => {
  const fg = parseColorToRgb(foreground);
  const bg = parseColorToRgb(background);

  if (!fg || !bg) {
    return null;
  }

  const fgLum = 0.2126 * normalize(fg.r) + 0.7152 * normalize(fg.g) + 0.0722 * normalize(fg.b);
  const bgLum = 0.2126 * normalize(bg.r) + 0.7152 * normalize(bg.g) + 0.0722 * normalize(bg.b);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
};

export const getWcagRating = (ratio: number): WcagRating => ({
  normalAA: ratio >= 4.5,
  normalAAA: ratio >= 7,
  largeAA: ratio >= 3,
  largeAAA: ratio >= 4.5,
});

export const evaluateContrast = (foreground: string, background: string): ContrastReport | null => {
  const ratio = contrastRatio(foreground, background);

  if (ratio === null) {
    return null;
  }

  return {
    ratio,
    wcag: getWcagRating(ratio),
  };
};

const tuneColorToTarget = (foreground: string, background: string, targetRatio: number): string | null => {
  const parsed = parse(foreground);
  if (!parsed) {
    return null;
  }

  const hsl = toHsl(parsed);
  if (!hsl) {
    return null;
  }

  const baseLightness = hsl.l ?? 0.5;
  let best: { delta: number; color: string; ratio: number } | null = null;

  for (const direction of [-1, 1]) {
    for (let step = 1; step <= 100; step += 1) {
      const nextLightness = clamp01(baseLightness + direction * step * 0.01);
      const ratio = contrastRatio(
        formatHex({ mode: 'hsl', h: hsl.h ?? 0, s: hsl.s ?? 0, l: nextLightness }),
        background,
      );

      if (ratio === null || ratio < targetRatio) {
        continue;
      }

      const color = formatHex({ mode: 'hsl', h: hsl.h ?? 0, s: hsl.s ?? 0, l: nextLightness });
      const delta = Math.abs(nextLightness - baseLightness);

      if (!best || delta < best.delta) {
        best = { delta, color, ratio };
      }
      break;
    }
  }

  return best?.color ?? null;
};

export const suggestNearestCompliantColors = (foreground: string, background: string): ContrastSuggestion[] => {
  const suggestions: ContrastSuggestion[] = [];
  const aa = tuneColorToTarget(foreground, background, 4.5);
  const aaa = tuneColorToTarget(foreground, background, 7);

  if (aa) {
    suggestions.push({ label: 'AA normal text', color: aa, ratio: contrastRatio(aa, background) ?? 0 });
  }

  if (aaa && aaa !== aa) {
    suggestions.push({ label: 'AAA normal text', color: aaa, ratio: contrastRatio(aaa, background) ?? 0 });
  }

  return suggestions;
};

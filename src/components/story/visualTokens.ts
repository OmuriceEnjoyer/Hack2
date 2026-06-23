/**
 * `colorToken`, `climate` and `dominantEvent` arrive from the backend as
 * identifiers (not URLs). The frontend builds the visual locally with CSS,
 * so these maps turn each identifier into concrete styling.
 */

interface StageColor {
  base: string;
  glow: string;
}

const COLOR_TOKENS: Record<string, StageColor> = {
  emerald: { base: '#10b981', glow: '#34d399' },
  amber: { base: '#f59e0b', glow: '#fbbf24' },
  rose: { base: '#f43f5e', glow: '#fb7185' },
  violet: { base: '#8b5cf6', glow: '#a78bfa' },
  cyan: { base: '#06b6d4', glow: '#22d3ee' },
  sky: { base: '#0ea5e9', glow: '#38bdf8' },
  lime: { base: '#84cc16', glow: '#a3e635' },
  slate: { base: '#64748b', glow: '#94a3b8' },
};

const FALLBACK_COLOR: StageColor = { base: '#8b5cf6', glow: '#a78bfa' };

export function colorFor(token: string): StageColor {
  return COLOR_TOKENS[token] ?? FALLBACK_COLOR;
}

const CLIMATE_GRADIENT: Record<string, string> = {
  PIXEL_FOREST: 'linear-gradient(135deg, #064e3b, #022c22)',
  NEON_CAVE: 'linear-gradient(135deg, #312e81, #4c1d95)',
  CLOUD_AQUARIUM: 'linear-gradient(135deg, #0e7490, #155e75)',
  RETRO_ARCADE: 'linear-gradient(135deg, #9d174d, #581c87)',
};

export function climateBackground(climate: string): string {
  return CLIMATE_GRADIENT[climate] ?? 'linear-gradient(135deg, #1f2937, #111827)';
}

const EVENT_LABEL: Record<string, string> = {
  HAMBRE: 'Hambre',
  ABANDONO: 'Abandono',
  MUTACION: 'Mutación',
  FUGA: 'Fuga',
  CONFLICTO: 'Conflicto',
  REPRODUCCION_MASIVA: 'Reproducción masiva',
  SENAL_CORRUPTA: 'Señal corrupta',
};

export function eventLabel(event: string): string {
  return EVENT_LABEL[event] ?? event;
}

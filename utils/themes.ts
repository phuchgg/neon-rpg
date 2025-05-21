export const themes = {
  default: {
    background: '#0d0c1d',   // cosmic black
    text: '#fefefe',         // near white
    accent: '#00f9ff',       // neon cyan
  },
  jade_echo: {
    background: '#0d1f14',   // dark jade stone
    text: '#d8ffe3',         // pale mint glow
    accent: '#2aff80',       // vibrant jade pulse
  },
  fire_red: {
    background: '#1a0000',
    text: '#ffe0e0',
    accent: '#ff1a1a',
  },
  nightwave: {
    background: '#0a0f29',
    text: '#9cd8ff',
    accent: '#4f9bff',
  },
  ice_pulse: {
    background: '#011f2a',
    text: '#b0faff',
    accent: '#00e0ff',
  },
  synthcore: {
    background: '#1b0029',
    text: '#ffb6f9',
    accent: '#ff3cac',
  },
} as const;

export type ThemeKey = keyof typeof themes;
export type Theme = typeof themes[ThemeKey];

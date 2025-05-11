export interface Reward {
  id: string;
  name: string;
  cost: number;
  type: 'theme' | 'badge' | 'hud' | 'avatar';
}

export const rewards: Reward[] = [
  { id: 'neon_theme', name: '🟢 Neon Green Theme', cost: 100, type: 'theme' },
  { id: 'fire_red', name: '🔥 Fire Red Theme', cost: 120, type: 'theme' },
  { id: 'nightwave', name: '🌌 Nightwave Theme', cost: 130, type: 'theme' },
  { id: 'ice_pulse', name: '❄️ Ice Pulse Theme', cost: 140, type: 'theme' },
  { id: 'synthcore', name: '💜 Synthcore Theme', cost: 160, type: 'theme' },
  { id: 'synth_hood', name: '🧢 Synthmancer Hood', cost: 150, type: 'hud' },
  { id: 'hud_nightwave', name: '🌌 Nightwave HUD', cost: 200, type: 'hud' },
  { id: 'badge_glitch', name: '🎖️ Glitch Badge', cost: 50, type: 'badge' },
];

export interface Reward {
  id: string;
  name: string;
  cost: number;
  type: 'theme' | 'badge' | 'hud' | 'avatar';
}

export const rewards: Reward[] = [
  { id: 'neon_theme', name: '🟢 Neon Green Theme', cost: 1000, type: 'theme' },
  { id: 'fire_red', name: '🔥 Fire Red Theme', cost: 120, type: 'theme' },
  { id: 'nightwave', name: '🌌 Nightwave Theme', cost: 1300, type: 'theme' },
  { id: 'ice_pulse', name: '❄️ Ice Pulse Theme', cost: 1400, type: 'theme' },
  { id: 'synthcore', name: '💜 Synthcore Theme', cost: 1600, type: 'theme' },
  { id: 'synth_hood', name: '🧢 Synthmancer Hood', cost: 1500, type: 'hud' },
  { id: 'hud_nightwave', name: '🌌 Nightwave HUD', cost: 2000, type: 'hud' },
  { id: 'badge_glitch', name: '🎖️ Glitch Badge', cost: 500, type: 'badge' },
  { id: 'badge_cyberfox', name: '🦊 Cyber Fox Badge', cost: 100, type: 'badge' },
  { id: 'badge_neoncat', name: '🐱‍👤 Neon Cat Badge', cost: 150, type: 'badge' },
  { id: 'badge_mechskull', name: '💀 Mech Skull Badge', cost: 2000, type: 'badge' },
  { id: 'badge_pixelbot', name: '🤖 Pixel Bot Badge', cost: 2500, type: 'badge' },
  { id: 'badge_glowslime', name: '🧪 Glow Slime Badge', cost: 3000, type: 'badge' },
  { id: 'badge_hologram', name: '🌌 Hologram Badge', cost: 4000, type: 'badge' },
  { id: 'badge_darklotus', name: '🌺 Dark Lotus Badge', cost: 5000, type: 'badge' },
  { id: 'badge_auraflame', name: '🔥 Aura Flame Badge', cost: 6000, type: 'badge' },
  { id: 'badge_neonphoenix', name: '🦅 Neon Phoenix Badge', cost: 7500, type: 'badge' },
];

export type PlayerClass = {
  id: string;
  name: string;
  lore: string;
  bonus: string;
  npc: {
    avatar: string;
    name: string;
    quote: string;
  };
  locked?: boolean;
};

export const classes: PlayerClass[] = [
  {
    id: 'ghostrunner',
    name: '🏃 Ghostrunner',
    lore: 'Move quiet. Move fast. Leave no task behind.',
    bonus: '+20% XP for fast tasks (≤10 chars)',
    npc: {
      avatar: '👻',
      name: 'Shadeflux',
      quote: '“You’re light on your feet. But is your mind as sharp?”',
    },
  },
  {
    id: 'netcrasher',
    name: '💻 Netcrasher',
    lore: 'There is no task too tangled for a line of truth.',
    bonus: '+XP for tasks like “code”, “debug”, “fix”, “study”',
    npc: {
      avatar: '🖥️',
      name: 'ZeroTrace',
      quote: '“The system bends to those who persist.”',
    },
  },
  {
    id: 'synthmancer',
    name: '🔮 Synthmancer',
    lore: 'Balance brings mastery. Consistency is divinity.',
    bonus: '+2 XP for all completed tasks',
    npc: {
      avatar: '🎼',
      name: 'Resonance',
      quote: '“A rhythm kept is progress earned.”',
    },
  },
  {
    id: 'edgewalker',
    name: '🔥 Edgewalker (Locked)',
    lore: 'They do not chase XP. They hunt legacy.',
    bonus: '+XP for "boss", "project", "long" tasks',
    npc: {
      avatar: '🔥',
      name: 'Ashveil',
      quote: '“Legacy is not given. It is taken.”',
    },
    locked: true,
  },
];

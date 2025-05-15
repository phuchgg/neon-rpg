import { ImageSourcePropType } from "react-native";

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
  icon: ImageSourcePropType;
};

export const classes: PlayerClass[] = [
  {
    id: 'ghostrunner',
    name: 'Ghostrunner',
    icon: require('../assets/characters/ghostrunner.png'),
    npc: {
      avatar: require('../assets/characters/ghostrunner.png'),
      name: 'Shadeflux',
      quote: '“You’re light on your feet. But is your mind as sharp?”',
    },
    lore: 'Move quiet. Move fast. Leave no task behind.',
    bonus: '+20% XP for fast tasks (≤10 chars)',
  },
  {
    id: 'netcrasher',
    name: 'Netcrasher',
    icon: require('../assets/characters/netcrasher.png'),
    npc: {
      avatar: require('../assets/characters/netcrasher.png'),
      name: 'ZeroTrace',
      quote: '“The system bends to those who persist.”',
    },
    lore: 'There is no task too tangled for a line of truth.',
    bonus: '+XP for tasks like “code”, “debug”, “fix”, “study”',
  },
  {
    id: 'synthmancer',
    name: 'Synthmancer',
    icon: require('../assets/characters/synthmancer.png'),
    npc: {
      avatar: require('../assets/characters/synthmancer.png'),
      name: 'Resonant',
      quote: '“Balance brings mastery. Consistency is divinity.”',
    },
    lore: 'Balance brings mastery. Consistency is divinity.',
    bonus: '+2 XP for all completed tasks',
  },
  {
    id: 'edgewalker',
    name: 'Edgewalker (Locked)',
    icon: require('../assets/characters/edgewalker.png'),
    npc: {
      avatar: require('../assets/characters/edgewalker.png'),
      name: 'Ashveil',
      quote: '“Legacy is not given. It is taken.”',
    },
    lore: 'They do not chase XP. They hunt legacy.',
    bonus: '+XP for "boss", "project", "long" tasks',
    
    locked: true,
  },
];

export const CLASS_SWITCH_COST = 500;
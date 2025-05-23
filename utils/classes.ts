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
    name: 'Ghost Runner',
    icon: require('../assets/characters/ghostrunner.png'),
    npc: {
      avatar: require('../assets/characters/ghostrunner.png'),
      name: 'Shadeflux',
      quote: '“Bạn di chuyển nhẹ như gió. Nhưng tâm trí bạn có sắc bén như thế không?”',
    },
    lore: 'Di chuyển lặng lẽ. Di chuyển nhanh chóng. Không để sót nhiệm vụ.',
    bonus: '+20% XP cho các nhiệm vụ nhanh (≤10 ký tự)',
  },
  {
    id: 'netcrasher',
    name: 'Net Crasher',
    icon: require('../assets/characters/netcrasher.png'),
    npc: {
      avatar: require('../assets/characters/netcrasher.png'),
      name: 'ZeroTrace',
      quote: '“Hệ thống sẽ khuất phục những ai kiên trì.”',
    },
    lore: 'Không có nhiệm vụ nào quá rối rắm đối với dòng chân lý.',
    bonus: '+XP cho các nhiệm vụ như “code”, “debug”, “fix”, “study”',
  },
  {
    id: 'synthmancer',
    name: 'Synthmancer',
    icon: require('../assets/characters/synthmancer.png'),
    npc: {
      avatar: require('../assets/characters/synthmancer.png'),
      name: 'Resonant',
      quote: '“Cân bằng tạo nên sự thành thạo. Kiên trì là thần thánh.”',
    },
    lore: 'Cân bằng tạo nên sự thành thạo. Kiên trì là thần thánh.',
    bonus: '+2 XP cho mọi nhiệm vụ hoàn thành',
  },
  {
    id: 'edgewalker',
    name: 'Edge Walker (Đã Khóa)',
    icon: require('../assets/characters/edgewalker.png'),
    npc: {
      avatar: require('../assets/characters/edgewalker.png'),
      name: 'Ashveil',
      quote: '“Di sản không được ban cho. Nó phải được giành lấy.”',
    },
    lore: 'Họ không theo đuổi XP. Họ săn đuổi di sản.',
    bonus: '+XP cho các nhiệm vụ "boss", "project", "long"',
    
    locked: true,
  },
];

export const CLASS_SWITCH_COST = 500;

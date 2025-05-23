import { Quest } from '../utils/type';

const taskTemplates = [
  { id: 'task_5', title: 'Hoàn thành {n} nhiệm vụ', desc: 'Năng suất nào.', baseTarget: 5, baseXp: 30 },
  { id: 'task_speed', title: 'Nhanh chóng thực hiện {n} nhiệm vụ', desc: 'Tăng tốc chính mình.', baseTarget: 3, baseXp: 20 },
];

const bossTemplates = [
  { id: 'boss_mini', title: 'Đánh bại {n} Boss Nhỏ', desc: 'Phô diễn kỹ năng chính mình', baseTarget: 2, baseXp: 50 },
  { id: 'boss_elite', title: 'Đã bại {n} Boss Tinh Anh', desc: 'Không khoang nhượng.', baseTarget: 3, baseXp: 80 },
  { id: 'boss_mega', title: 'Tiêu diệt {n} Boss Siêu Cấp', desc: 'Thử thách cuối cùng', baseTarget: 1, baseXp: 150 },
];

const shuffle = <T,>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);

export const generateUniqueQuests = (type: 'Daily' | 'Weekly' | 'Event', existingIds: string[] = []): Quest[] => {
  const templatePool = type === 'Event' ? bossTemplates : [...taskTemplates, ...bossTemplates];
  const available = templatePool.filter((t) =>
    !existingIds.some((id) => id.startsWith(t.id))
  );

  const questCount = type === 'Daily' ? 2 : type === 'Weekly' ? 3 : 2;
  const selected = shuffle(available).slice(0, questCount);

  const scale = type === 'Daily' ? 1 : type === 'Weekly' ? 2 : 3;

  return selected.map((template) => {
    const target = template.baseTarget * scale + Math.floor(Math.random() * scale);
    const xp = template.baseXp * scale + Math.floor(Math.random() * 20);

    const quest: Quest = {
      id: `${template.id}_${Date.now()}`,
      title: template.title.replace('{n}', `${target}`),
      description: template.desc,
      progress: 0,
      isComplete: false,
      type: template.id.startsWith('task') ? 'task' : 'boss',
      condition: { target, current: 0 },
      rewardXp: xp,
    };
  
    // 🆕 Add timer for "Check Off {n} Tasks Fast"
    if (template.id === 'task_speed') {
      quest.timeLimit = 6 * 60 * 60 * 1000; // 6 hours in ms
      quest.startTime = Date.now(); // Starts now (or after login)
    }
  
    return quest;
    
  });
};

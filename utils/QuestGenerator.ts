import { Quest } from '../utils/type';

const taskTemplates = [
  { id: 'task_5', title: 'Complete {n} Tasks', desc: 'Stay productive.', baseTarget: 5, baseXp: 30 },
  { id: 'task_speed', title: 'Check Off {n} Tasks Fast', desc: 'Speedrun your life.', baseTarget: 3, baseXp: 20 },
];

const bossTemplates = [
  { id: 'boss_mini', title: 'Defeat {n} Mini Bosses', desc: 'Show your skills.', baseTarget: 2, baseXp: 50 },
  { id: 'boss_elite', title: 'Crush {n} Elite Bosses', desc: 'No mercy for elites.', baseTarget: 3, baseXp: 80 },
  { id: 'boss_mega', title: 'Annihilate {n} Mega Boss', desc: 'The ultimate challenge.', baseTarget: 1, baseXp: 150 },
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

    return {
      id: `${template.id}_${Date.now()}`,  // Unique ID per day
      title: template.title.replace('{n}', `${target}`),
      description: template.desc,
      progress: 0,
      isComplete: false,
      type: template.id.startsWith('task') ? 'task' : 'boss',
      condition: { target, current: 0 },
      rewardXp: xp,
    };
  });
};

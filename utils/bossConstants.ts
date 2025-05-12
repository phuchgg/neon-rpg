import { Boss } from './type';

// Boss damage per task (%)
export const tierDamagePercentMap: Record<Boss['tier'], number> = {
  mini: 2,   // Mini bosses lose 2% per task
  elite: 1,  // Elite bosses lose 1% per task
  mega: 0.5, // Mega bosses lose 0.5% per task
};

import { Boss } from './type';

// Boss damage per task (%)
export const tierDamagePercentMap: Record<Boss['tier'], number> = {
  mini: 10,   // Mini bosses lose 10% per task
  elite: 5,  // Elite bosses lose 5% per task
  mega: 1, // Mega bosses lose 1% per task
};

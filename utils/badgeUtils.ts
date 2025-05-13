import { rewards } from './rewards';

/**
 * Get badge icon by badge ID.
 * Returns 🏅 as fallback if not found.
 */
export const getBadgeIcon = (badgeId: string | null): string => {
  if (!badgeId) return '';
  const badge = rewards.find((item) => item.type === 'badge' && item.id === badgeId);
  if (!badge) return '🏅';
  
  // Extract emoji from badge name (assuming it's in the name prefix)
  const match = badge.name.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u);
  return match ? match[0] : '🏅';
};

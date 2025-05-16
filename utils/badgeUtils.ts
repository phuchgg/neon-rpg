import { rewards } from './rewards';
import AssetManager from './AssetManager';

/**
 * Get badge icon by badge ID.
 * Returns 🏅 as fallback if not found.
 */
export const getBadgeImage = (badgeId: string | null) => {
  if (!badgeId) return null;

  const key = badgeId.replace('badge_', '');
  return AssetManager.Rewards[key] || null;
};
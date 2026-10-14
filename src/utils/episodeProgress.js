/**
 * Episode progress calculations and stats helpers
 */

/**
 * Calculates percentage completion (0 - 100)
 * @param {number} watched 
 * @param {number|null} total 
 * @returns {number}
 */
export function calculateProgressPercentage(watched = 0, total = null) {
  if (!total || total <= 0) return 0;
  const pct = Math.round((Number(watched) / Number(total)) * 100);
  return Math.min(Math.max(pct, 0), 100);
}

/**
 * Builds an array of episode objects for an anime
 * @param {Object} anime 
 * @returns {Array<{ number: number, isWatched: boolean, isAired: boolean }>}
 */
export function generateEpisodeList(anime) {
  if (!anime) return [];
  const total = anime.totalEpisodes ? Number(anime.totalEpisodes) : Math.max(anime.currentEpisode || 1, 12);
  const watched = Number(anime.currentEpisode) || 0;
  const watchedList = Array.isArray(anime.watchedEpisodes) ? new Set(anime.watchedEpisodes) : null;

  const episodes = [];
  for (let i = 1; i <= total; i++) {
    // If specific episode array is tracked, use that; otherwise compare to currentEpisode
    const isWatched = watchedList ? watchedList.has(i) : i <= watched;
    episodes.push({
      number: i,
      isWatched,
      title: `Episode ${i}`,
    });
  }

  return episodes;
}

/**
 * Calculates total hours watched for an anime or list
 * @param {Array} animeList 
 * @returns {{ totalHours: number, totalEpisodesWatched: number }}
 */
export function calculateWatchStats(animeList = []) {
  let totalEpisodesWatched = 0;
  let totalMinutes = 0;

  for (const a of animeList) {
    const watched = Number(a.currentEpisode) || 0;
    const duration = Number(a.episodeDuration) || 24;
    totalEpisodesWatched += watched;
    totalMinutes += watched * duration;
  }

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  return { totalHours, totalEpisodesWatched };
}

/**
 * Form validation helpers for AnimeForm and Settings
 */

export function validateAnimeForm(formData) {
  const errors = {};

  if (!formData.title || !formData.title.trim()) {
    errors.title = 'Anime title is required.';
  }

  if (formData.totalEpisodes !== '' && formData.totalEpisodes !== null && formData.totalEpisodes !== undefined) {
    const total = Number(formData.totalEpisodes);
    if (isNaN(total) || total < 1) {
      errors.totalEpisodes = 'Total episodes must be at least 1.';
    }
  }

  if (formData.currentEpisode !== '' && formData.currentEpisode !== null && formData.currentEpisode !== undefined) {
    const current = Number(formData.currentEpisode);
    if (isNaN(current) || current < 0) {
      errors.currentEpisode = 'Watched episodes cannot be negative.';
    }
    if (formData.totalEpisodes && current > Number(formData.totalEpisodes)) {
      errors.currentEpisode = 'Watched episodes cannot exceed total episodes.';
    }
  }

  if (formData.email && formData.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

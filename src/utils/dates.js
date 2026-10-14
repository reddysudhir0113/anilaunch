/**
 * Date formatting and calendar helper utilities
 */

import { format, parseISO, isValid, isToday, isTomorrow, isYesterday } from 'date-fns';

/**
 * Pretty formats a date string or Date object
 * @param {Date|string} date 
 * @param {string} [formatStr='MMM d, yyyy • h:mm a']
 * @returns {string}
 */
export function formatLaunchDate(date, formatStr = 'MMM d, yyyy • h:mm a') {
  if (!date) return 'TBA';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'TBA';
  return format(parsed, formatStr);
}

/**
 * Returns human friendly label for release date (e.g. 'Today at 8:00 PM', 'Tomorrow', 'Saturday')
 * @param {Date|string} date 
 * @returns {string}
 */
export function getRelativeLaunchLabel(date) {
  if (!date) return 'TBA';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'TBA';

  const timeStr = format(parsed, 'h:mm a');
  if (isToday(parsed)) {
    return `Today at ${timeStr}`;
  }
  if (isTomorrow(parsed)) {
    return `Tomorrow at ${timeStr}`;
  }
  if (isYesterday(parsed)) {
    return `Yesterday at ${timeStr}`;
  }
  return format(parsed, 'EEE, MMM d • h:mm a');
}

/**
 * Formats duration in minutes into 'Xh Ym'
 * @param {number} minutes 
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (!minutes || isNaN(minutes)) return '24m';
  const mins = Number(minutes);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ''}`;
  return `${m}m`;
}

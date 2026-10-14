/**
 * Notification Service for AniLaunch
 * Manages in-app notification center, desktop browser push, and reminder scheduling.
 */

import { differenceInMinutes, differenceInSeconds } from 'date-fns';
import { calculateNextRelease } from './scheduleService';
import { getStoredNotifications, saveStoredNotifications, safeGetItem, safeSetItem } from './localStorage';
import { sendEpisodeNotificationEmail, isEmailJSConfigured } from './emailService';

const SENT_KEYS_STORAGE = 'anilaunch_sent_reminder_keys';

/**
 * Gets the set of already sent reminder keys
 * @returns {Set<string>}
 */
function getSentReminderKeys() {
  const arr = safeGetItem(SENT_KEYS_STORAGE, []);
  return new Set(arr);
}

/**
 * Records a reminder key as sent to prevent duplicate alerts
 * @param {string} key 
 */
function recordSentReminderKey(key) {
  const keys = getSentReminderKeys();
  keys.add(key);
  // Keep size constrained to latest 300 entries
  const list = Array.from(keys).slice(-300);
  safeSetItem(SENT_KEYS_STORAGE, list);
}

/**
 * Requests permission for browser desktop notifications
 * @returns {Promise<'granted'|'denied'|'default'>}
 */
export async function requestBrowserNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Check browser notification status
 * @returns {'granted'|'denied'|'default'|'unsupported'}
 */
export function getBrowserNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * Dispatches a native browser desktop notification if permitted
 * @param {string} title 
 * @param {Object} options 
 */
export function sendBrowserNotification(title, options = {}) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        silent: false,
        ...options,
      });
    } catch (err) {
      console.warn('Native notification failed:', err);
    }
  }
}

/**
 * Checks all anime for upcoming or freshly released episodes
 * @param {Array} animeList 
 * @param {Object} settings 
 * @param {Function} [onNewNotification=null] Optional toast callback
 */
export function runReminderCheck(animeList, settings = {}, onNewNotification = null) {
  if (!Array.isArray(animeList) || animeList.length === 0) return;

  const now = new Date();
  const sentKeys = getSentReminderKeys();
  const currentNotifications = getStoredNotifications();
  const newNotifications = [];

  const defaultLeadMinutes = settings?.emailReminders?.leadMinutes ?? 60;
  const destinationEmail = settings?.emailReminders?.email || '';
  const emailEnabled = settings?.emailReminders?.enabled && destinationEmail && isEmailJSConfigured();

  for (const anime of animeList) {
    if (anime.status === 'completed' || anime.status === 'on_hold') continue;

    const { nextReleaseDate, nextEpisodeNumber } = calculateNextRelease(anime, now);
    if (!nextReleaseDate || !nextEpisodeNumber) continue;

    const diffMinutes = differenceInMinutes(nextReleaseDate, now);
    const diffSeconds = differenceInSeconds(nextReleaseDate, now);

    // 1. Episode Releasing Soon (within configured lead time)
    const leadTime = anime.reminderLeadMinutes ? Number(anime.reminderLeadMinutes) : defaultLeadMinutes;
    const reminderKey = `reminder_${anime.id}_ep${nextEpisodeNumber}_lead${leadTime}`;

    if (diffMinutes >= 0 && diffMinutes <= leadTime && !sentKeys.has(reminderKey)) {
      const minuteLabel = diffMinutes <= 1 ? 'less than a minute' : `${diffMinutes} minutes`;
      const notifItem = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        animeId: anime.id,
        animeTitle: anime.title,
        episodeNumber: nextEpisodeNumber,
        type: 'upcoming_launch',
        title: `Launch Alert: ${anime.title}`,
        message: `Episode ${nextEpisodeNumber} launches in ${minuteLabel}!`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      recordSentReminderKey(reminderKey);
      newNotifications.push(notifItem);

      // Browser notification
      sendBrowserNotification(notifItem.title, { body: notifItem.message });

      // Email notification
      if (emailEnabled) {
        sendEpisodeNotificationEmail(destinationEmail, {
          animeTitle: anime.title,
          episodeNumber: nextEpisodeNumber,
          message: notifItem.message,
        }).catch((err) => console.warn('Email notification failed:', err));
      }

      if (onNewNotification) onNewNotification(notifItem);
    }

    // 2. Episode Just Launched (within the last 20 minutes)
    const releasedKey = `launched_${anime.id}_ep${nextEpisodeNumber}`;
    if (diffSeconds < 0 && Math.abs(diffMinutes) <= 20 && !sentKeys.has(releasedKey)) {
      const launchItem = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        animeId: anime.id,
        animeTitle: anime.title,
        episodeNumber: nextEpisodeNumber,
        type: 'launched_now',
        title: `Episode Launched! 🚀`,
        message: `${anime.title} Episode ${nextEpisodeNumber} is now live and ready to track!`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      recordSentReminderKey(releasedKey);
      newNotifications.push(launchItem);

      sendBrowserNotification(launchItem.title, { body: launchItem.message });

      // Email for launched episode too
      if (emailEnabled) {
        sendEpisodeNotificationEmail(destinationEmail, {
          animeTitle: anime.title,
          episodeNumber: nextEpisodeNumber,
          message: launchItem.message,
        }).catch((err) => console.warn('Email notification failed:', err));
      }

      if (onNewNotification) onNewNotification(launchItem);
    }
  }

  if (newNotifications.length > 0) {
    const updated = [...newNotifications, ...currentNotifications].slice(0, 50);
    saveStoredNotifications(updated);
  }
}

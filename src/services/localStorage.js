/**
 * LocalStorage Service for AniLaunch
 * Safe JSON parsing, schema management, versioning, export/import utilities.
 */

const STORAGE_KEYS = {
  VERSION: 'anilaunch_storage_version',
  ANIME_LIST: 'anilaunch_anime_list_v1',
  NOTIFICATIONS: 'anilaunch_notifications_v1',
  SETTINGS: 'anilaunch_settings_v1',
};

const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS = {
  displayName: 'Cosmic Pilot',
  themeAccent: 'violet', // violet, cyan, magenta
  defaultCalendarView: 'weekly', // weekly, monthly
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  browserNotificationsEnabled: false,
  emailReminders: {
    enabled: false,
    email: '',
    leadMinutes: 60, // 0, 15, 30, 60, 1440
  },
  completedCleanup: {
    autoDelete: false,
    retentionDays: 30,
  },
};

/**
 * Safely reads from LocalStorage
 * @param {string} key 
 * @param {*} fallback 
 * @returns {*}
 */
export function safeGetItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

/**
 * Safely writes to LocalStorage
 * @param {string} key 
 * @param {*} value 
 * @returns {boolean}
 */
export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
    if (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      alert('Local storage quota exceeded! Please remove some items or check browser storage settings.');
    }
    return false;
  }
}

/**
 * Get anime list from storage
 * @returns {Array}
 */
export function getStoredAnimeList() {
  return safeGetItem(STORAGE_KEYS.ANIME_LIST, []);
}

/**
 * Persist anime list to storage
 * @param {Array} animeList 
 * @returns {boolean}
 */
export function saveStoredAnimeList(animeList) {
  return safeSetItem(STORAGE_KEYS.ANIME_LIST, animeList);
}

/**
 * Get notification history from storage
 * @returns {Array}
 */
export function getStoredNotifications() {
  return safeGetItem(STORAGE_KEYS.NOTIFICATIONS, []);
}

/**
 * Persist notifications to storage
 * @param {Array} notifications 
 * @returns {boolean}
 */
export function saveStoredNotifications(notifications) {
  return safeSetItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

/**
 * Get user settings
 * @returns {Object}
 */
export function getStoredSettings() {
  const current = safeGetItem(STORAGE_KEYS.SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...current };
}

/**
 * Persist user settings
 * @param {Object} settings 
 * @returns {boolean}
 */
export function saveStoredSettings(settings) {
  return safeSetItem(STORAGE_KEYS.SETTINGS, settings);
}

/**
 * Package all user data into an exportable JSON payload
 * @returns {Object}
 */
export function exportAllData() {
  return {
    version: CURRENT_SCHEMA_VERSION,
    exportDate: new Date().toISOString(),
    animeList: getStoredAnimeList(),
    notifications: getStoredNotifications(),
    settings: getStoredSettings(),
  };
}

/**
 * Imports validated data JSON payload into localStorage
 * @param {Object} data 
 * @param {boolean} merge If true, merges with existing anime list; if false, replaces
 * @returns {{ success: boolean, message: string }}
 */
export function importUserData(data, merge = false) {
  try {
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid data format.' };
    }

    if (!Array.isArray(data.animeList)) {
      return { success: false, message: 'Missing anime list in import data.' };
    }

    let finalAnimeList = data.animeList;
    if (merge) {
      const existing = getStoredAnimeList();
      const existingIds = new Set(existing.map((a) => a.id));
      const newItems = data.animeList.filter((a) => !existingIds.has(a.id));
      finalAnimeList = [...existing, ...newItems];
    }

    saveStoredAnimeList(finalAnimeList);

    if (data.settings) {
      saveStoredSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }

    return {
      success: true,
      message: `Successfully imported ${finalAnimeList.length} anime entries.`,
    };
  } catch (err) {
    return { success: false, message: err.message || 'Import failed.' };
  }
}

/**
 * Clears all LocalStorage data for AniLaunch
 */
export function clearAllStoredData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ANIME_LIST);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.VERSION);
    return true;
  } catch (err) {
    console.error('Error clearing storage:', err);
    return false;
  }
}

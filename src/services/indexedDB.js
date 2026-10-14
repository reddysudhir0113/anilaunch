/**
 * IndexedDB Service for AniLaunch
 * Safely persists large anime poster and banner image blobs without bloating LocalStorage.
 */

const DB_NAME = 'anilaunch_db';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// In-memory cache for Object URLs to avoid redundant blob url creation
const objectUrlCache = new Map();

/**
 * Initializes and returns the IndexedDB instance
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported in this environment');
      return resolve(null);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      resolve(null);
    };
  });
}

/**
 * Saves a Blob or File with a given key in IndexedDB
 * @param {string} key 
 * @param {Blob|File} blob 
 * @returns {Promise<boolean>}
 */
export async function saveImageBlob(key, blob) {
  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, key);

      request.onsuccess = () => {
        // Invalidate cached object URL if overwriting
        if (objectUrlCache.has(key)) {
          URL.revokeObjectURL(objectUrlCache.get(key));
          objectUrlCache.delete(key);
        }
        resolve(true);
      };

      request.onerror = (err) => {
        console.error('Error saving image blob to IndexedDB:', err);
        resolve(false);
      };
    });
  } catch (err) {
    console.error('saveImageBlob caught error:', err);
    return false;
  }
}

/**
 * Retrieves a Blob from IndexedDB by key
 * @param {string} key 
 * @returns {Promise<Blob|null>}
 */
export async function getImageBlob(key) {
  try {
    const db = await openDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (err) => {
        console.error('Error getting image blob from IndexedDB:', err);
        resolve(null);
      };
    });
  } catch (err) {
    console.error('getImageBlob caught error:', err);
    return null;
  }
}

/**
 * Retrieves an active Object URL for a stored blob key
 * @param {string} key 
 * @returns {Promise<string|null>}
 */
export async function getImageUrlByKey(key) {
  if (!key) return null;
  
  // Return cached URL if valid
  if (objectUrlCache.has(key)) {
    return objectUrlCache.get(key);
  }

  const blob = await getImageBlob(key);
  if (!blob) return null;

  try {
    const url = URL.createObjectURL(blob);
    objectUrlCache.set(key, url);
    return url;
  } catch (err) {
    console.error('Failed to create object URL for blob:', err);
    return null;
  }
}

/**
 * Deletes a stored blob by key
 * @param {string} key 
 * @returns {Promise<boolean>}
 */
export async function deleteImageBlob(key) {
  if (!key) return true;

  if (objectUrlCache.has(key)) {
    URL.revokeObjectURL(objectUrlCache.get(key));
    objectUrlCache.delete(key);
  }

  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch (err) {
    console.error('deleteImageBlob error:', err);
    return false;
  }
}

/**
 * Clears all stored images from IndexedDB
 * @returns {Promise<boolean>}
 */
export async function clearAllImages() {
  // Revoke all cached object URLs
  for (const url of objectUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  objectUrlCache.clear();

  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch (err) {
    console.error('clearAllImages error:', err);
    return false;
  }
}

/**
 * Uploads a file, compresses slightly or stores as Blob, and returns the assigned key
 * @param {File} file 
 * @param {string} prefix 
 * @returns {Promise<string>}
 */
export async function uploadAndStoreImage(file, prefix = 'poster') {
  const key = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const success = await saveImageBlob(key, file);
  if (!success) {
    throw new Error('Could not persist image to IndexedDB. Browser storage may be full.');
  }
  return key;
}

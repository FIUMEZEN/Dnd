export const STORAGE_KEY = "dnd-characters-5e2014-v2";
export const CREATURES_STORAGE_KEY = "dnd-creatures-5e2014-v1";

export const storageAdapter = {
  async get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? { value: fallback } : { value: raw };
    } catch (error) {
      console.error("Storage read failed:", error);
      return { value: fallback };
    }
  },
  async set(key, value, fallback) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error("Storage write failed:", error);
      return false;
    }
  },
};

// Storage utility functions

// Get item from localStorage with optional parsing
export const getItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item from localStorage with key ${key}:`, error);
    return null;
  }
};

// Set item to localStorage with optional stringifying
export const setItem = <T>(key: string, value: T): void => {
  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error setting item to localStorage with key ${key}:`, error);
  }
};

// Remove item from localStorage
export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage with key ${key}:`, error);
  }
};

// Clear all items from localStorage
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};
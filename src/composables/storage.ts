import type { Awaitable, StorageLike, StorageLikeAsync } from "@vueuse/core";

const getStorage = (): StorageLike => {
  if (!isElectron) {
    return localStorage;
  }
  const electron = window.electron;
  return {
    getItem: (key: string): string | null => electron.getItem(key),
    setItem: (key: string, value: string): void => electron.setItem(key, value),
    removeItem: (key: string): void => electron.removeItem(key),
  };
};

const getStorageAsync = (): StorageLikeAsync => {
  if (!isElectron) {
    return localStorage;
  }
  const electron = window.electron;
  return {
    getItem: (key: string): Awaitable<string | null> => electron.getItemAsync(key),
    setItem: (key: string, value: string): Awaitable<void> => electron.setItemAsync(key, value),
    removeItem: (key: string): Awaitable<void> => electron.removeItemAsync(key),
  };
};

export const myStorage = getStorage();
export const myStorageAsync = getStorageAsync();

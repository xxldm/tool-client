import type { IpcRenderer } from "electron"

export interface Electron {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  removeItemAsync(key: string): Promise<void>;
}

declare global {
  interface Window {
    electron: Electron
  }
}

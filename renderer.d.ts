import type { IpcRenderer } from "electron"

export interface platform {
  isWin: boolean,
  isLinux: boolean,
  isMac: boolean,
}

export interface Electron {
  getPlatform(): platform;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  removeItemAsync(key: string): Promise<void>;
  closeApp(): Promise<void>;
}

declare global {
  interface Window {
    electron: Electron
  }
}

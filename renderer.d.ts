import type { IpcRendererEvent } from "electron"
import type { ProgressInfo, UpdateInfo } from "electron-updater";

export interface platform {
  isWin: boolean,
  isLinux: boolean,
  isMac: boolean,
}

export interface Electron {
  // 获取信息
  getPlatform(): platform;
  isPackage(): boolean;
  getDisplayCount(): number;

  // 持久化
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  removeItemAsync(key: string): Promise<void>;

  // 操作应用
  closeApp(): Promise<void>;

  // 更新相关
  getCurrentVersion(): string;
  checkUpdate(): Promise<void>;
  updateAvailable(listener: (event: IpcRendererEvent, updateInfo: UpdateInfo) => void): void;
  updateNotAvailable(listener: (event: IpcRendererEvent) => void): void;
  downloadUpdate(): Promise<void>;
  cancelDownloadUpdate(): Promise<void>;
  updateCancelled(listener: (event: IpcRendererEvent, updateInfo: UpdateInfo) => void): void;
  downloadProgress(listener: (event: IpcRendererEvent, progressInfo: ProgressInfo) => void): void;
  downloadDownloaded(listener: (event: IpcRendererEvent) => void): void;
  quitAndInstall(): Promise<void>;
  updateError(listener: (event: IpcRendererEvent, error: Error) => void): void
}

declare global {
  interface Window {
    electron: Electron
  }
}

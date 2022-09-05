import { type IpcRendererEvent, contextBridge, ipcRenderer } from "electron";
import type { ProgressInfo, UpdateInfo } from "electron-updater";
contextBridge.exposeInMainWorld("electron", {
  // 获取信息
  getPlatform: () => ipcRenderer.sendSync("getPlatform"),
  isPackage: () => ipcRenderer.sendSync("isPackage"),

  // 持久化
  getItem: (key: string) => ipcRenderer.sendSync("getItem", [key]),
  setItem: (key: string, value: string) => ipcRenderer.sendSync("setItem", [key, value]),
  removeItem: (key: string) => ipcRenderer.sendSync("removeItem", [key]),
  getItemAsync: (key: string) => ipcRenderer.invoke("getItemAsync", [key]),
  setItemAsync: (key: string, value: string) => ipcRenderer.invoke("setItemAsync", [key, value]),
  removeItemAsync: (key: string) => ipcRenderer.invoke("removeItemAsync", [key]),

  // 操作应用
  closeApp: () => ipcRenderer.invoke("closeApp"),

  // 更新相关
  getCurrentVersion: () => ipcRenderer.sendSync("getCurrentVersion"),
  checkUpdate: () => ipcRenderer.invoke("checkUpdate"),
  updateAvailable: (listener: (event: IpcRendererEvent, updateInfo: UpdateInfo) => void) => {
    ipcRenderer.on("updateAvailable", listener);
  },
  updateNotAvailable: (listener: (event: IpcRendererEvent) => void) => {
    ipcRenderer.on("updateNotAvailable", listener);
  },
  downloadUpdate: () => ipcRenderer.invoke("downloadUpdate"),
  cancelDownloadUpdate: () => ipcRenderer.invoke("cancelDownloadUpdate"),
  updateCancelled: (listener: (event: IpcRendererEvent, updateInfo: UpdateInfo) => void) => {
    ipcRenderer.on("updateCancelled", listener);
  },
  downloadProgress: (listener: (event: IpcRendererEvent, progressInfo: ProgressInfo) => void) => {
    ipcRenderer.on("downloadProgress", listener);
  },
  downloadDownloaded: (listener: (event: IpcRendererEvent) => void) => {
    ipcRenderer.on("downloadDownloaded", listener);
  },
  quitAndInstall: () => ipcRenderer.invoke("quitAndInstall"),
  updateError: (listener: (event: IpcRendererEvent, error: Error) => void) => {
    ipcRenderer.on("updateError", listener);
  },
});

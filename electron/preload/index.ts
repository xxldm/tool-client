import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electron", {
  getPlatform: () => ipcRenderer.sendSync("getPlatform"),
  getItem: (key: string) => ipcRenderer.sendSync("getItem", [key]),
  setItem: (key: string, value: string) => ipcRenderer.sendSync("setItem", [key, value]),
  removeItem: (key: string) => ipcRenderer.sendSync("removeItem", [key]),
  getItemAsync: (key: string) => ipcRenderer.invoke("getItemAsync", [key]),
  setItemAsync: (key: string, value: string) => ipcRenderer.invoke("setItemAsync", [key, value]),
  removeItemAsync: (key: string) => ipcRenderer.invoke("removeItemAsync", [key]),
  closeApp: () => ipcRenderer.invoke("closeApp"),
});

import { type BrowserWindow, app, ipcMain, nativeTheme, screen, shell } from "electron";
import Store from "electron-store";
import { autoUpdater } from "electron-updater";

import { configProcess, initIpc } from "./ipc";
import { createMenu } from "./menu";
import { createTray } from "./tray";
import { initUpdater } from "./updater";
import { createWindow } from "./window";

// VITE_DEV_SERVER_PORT 是 vite-plugin-electron 插件定义,取自vite开发服务器配置,与用户配置文件中的环境变量无直接关联
const env = import.meta.env as {
  VITE_DEV_SERVER_HOST: string
  VITE_DEV_SERVER_PORT: string
  VITE_DEV_SERVER_URL: string
  BASE_URL: string
  MODE: string
  DEV: boolean
  PROD: boolean
};

const platform = {
  isWin: process.platform === "win32",
  isLinux: process.platform === "linux",
  isMac: process.platform === "darwin",
};

if (platform.isWin) {
  app.setAppUserModelId(app.getName());
}

if (platform.isLinux) {
  // 不禁用硬件加速会各种卡死
  app.disableHardwareAcceleration();
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const isDebug = process.env.npm_lifecycle_event === "dev";

if (isDebug) {
  Object.defineProperty(app, "isPackaged", {
    get() {
      return true;
    },
  });
}

const window = {
  win: <BrowserWindow | undefined>undefined,
};

// 创建持久化
const store = new Store<Record<string, string>>();

// electron程序准备就绪
app.whenReady().then(() => {
  if (app.isPackaged) {
    initUpdater();
  }
  initAppListener();
  initAppStatus();
  initIpc();
  createWindow();
  createTray();
  if (isDebug) {
    createMenu();
  }
});

/**
 * 初始化程序监听
 */
function initAppListener() {
  app.on("window-all-closed", () => {
    if (store.get("isNormal") === "true") {
      app.quit();
    }
  });
  app.on("web-contents-created", (_event, webContents) => {
    webContents.addListener("new-window", (event, url) => {
      event.preventDefault();
      if (url.startsWith("http")) {
        shell.openExternal(url);
      }
    });
  });
}

/**
 * 初始化程序状态
 */
function initAppStatus() {
  // 以防从其余地方干掉了注册表，但设置项没有重置，每次打开读取注册表，重置设置项
  const { openAtLogin } = app.getLoginItemSettings();
  const oldValue = store.get("themeSource");
  store.set("openAtLogin", openAtLogin);
  // 打开程序的时候从配置文件加载,用户暗黑模式设置
  configProcess("themeSource", oldValue, store.get("themeSource")!);
}

export { app, ipcMain, window, store, platform, isDebug, autoUpdater, nativeTheme, env, screen };

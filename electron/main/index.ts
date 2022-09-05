import { type MenuItem, app, BrowserWindow, ipcMain, Menu, Tray } from "electron";
import Store from "electron-store";
import type { CancellationToken, ProgressInfo, UpdateInfo } from "electron-updater";
import { autoUpdater } from "electron-updater";
import { join } from "path";

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

let win: BrowserWindow | null = null;

// 创建持久化
const store = new Store<Record<string, string>>();

init();

app.whenReady().then(ready);

/**
 * 初始化
 */
function init() {
  if (app.isPackaged) {
    initUpdater();
  }
  initIpc();
  initListener();
  check();
}

/**
 * 初始化更新程序
 */
function initUpdater() {
  let cancellationToken: CancellationToken | undefined;
  // 关闭自动下载
  autoUpdater.autoDownload = false;
  //
  autoUpdater.disableWebInstaller = true;
  // 允许更新到预发布版本
  autoUpdater.allowPrerelease = store.get("allowPrerelease", "false") === "true";
  // 获取 本地版本 -> 最新版本 的更新日志
  autoUpdater.fullChangelog = true;
  // 允许从测试版回退到正式版, 降级会导致获取不到更新日志
  autoUpdater.allowDowngrade = true;
  // 同步获取版本
  ipcMain.on(
    "getCurrentVersion",
    event => (event.returnValue = autoUpdater.currentVersion.version),
  );
  // 页面调用检查更新
  ipcMain.handle("checkUpdate", async () => {
    const updateCheckResult = await autoUpdater.checkForUpdates().catch();
    cancellationToken = updateCheckResult?.cancellationToken;
  });
  // 有更新，发送更新信息到页面
  autoUpdater.on("update-available", (updateInfo: UpdateInfo) =>
    win?.webContents.send("updateAvailable", updateInfo),
  );
  // 没有更新，通知页面
  autoUpdater.on("update-not-available", () =>
    win?.webContents.send("updateNotAvailable"),
  );
  // 页面调用下载更新
  ipcMain.handle("downloadUpdate", () => {
    autoUpdater.downloadUpdate(cancellationToken).catch();
  });
  // 页面调用取消下载
  ipcMain.handle("cancelDownloadUpdate", () => cancellationToken?.cancel());
  autoUpdater.on("update-cancelled", (updateInfo: UpdateInfo) =>
    win?.webContents.send("updateCancelled", updateInfo),
  );
  // 开始下载，监听下载进度
  autoUpdater.on("download-progress", (progress: ProgressInfo) => {
    win?.webContents.send("downloadProgress", progress);
  });
  // 下载完毕
  autoUpdater.on("update-downloaded", () =>
    win?.webContents.send("downloadDownloaded"),
  );
  // 立即更新，如果没有调用这个方法，应用会在手动关闭后自动更新
  ipcMain.handle("quitAndInstall", () => autoUpdater.quitAndInstall(true, true));
  // 更新出错
  autoUpdater.on("error", (error: Error) =>
    win?.webContents.send("updateError", error),
  );
}

/**
 * 初始化通讯
 */
function initIpc() {
  initStoreIpc();
  initSystemIpc();
}

/**
 * 初始化持久化通讯
 */
function initStoreIpc() {
  // 配置文件读取
  ipcMain.on("getItem",
    (event, arg: string[]) => event.returnValue = store.get(arg[0]),
  );
  // 配置文件写入
  ipcMain.on("setItem",
    (event, arg: string[]) => {
      configProcess(arg[0], arg[1]);
      event.returnValue = store.set(arg[0], arg[1],
      );
    },
  );
  // 配置文件写入
  ipcMain.on("removeItem",
    (event, arg: string[]) => event.returnValue = store.delete(arg[0]),
  );
  // 配置文件读取
  ipcMain.handle("getItemAsync",
    (event, arg: string[]) => store.get(arg[0]),
  );
  // 配置文件写入
  ipcMain.handle("setItemAsync",
    (event, arg: string[]) => {
      configProcess(arg[0], arg[1]);
      return store.set(arg[0], arg[1]);
    },
  );
  // 配置文件写入
  ipcMain.handle("removeItemAsync",
    (event, arg: string[]) => store.delete(arg[0]),
  );
}

/**
 * 初始化程序方面的通讯
 */
function initSystemIpc() {
  ipcMain.on("getPlatform", event => event.returnValue = platform);
  ipcMain.on("isPackage", event => event.returnValue = app.isPackaged);
  ipcMain.handle("closeApp", () => app.quit());
}

/**
 * 初始化监听
 */
function initListener() {
  app.on("window-all-closed", () => {
    win = null;
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

/**
 * 检查程序以外的修改
 */
function check() {
  // 以防从其余地方干掉了注册表，但设置项没有重置，每次打开读取注册表，重置设置项
  const { openAtLogin } = app.getLoginItemSettings();
  store.set("openAtLogin", openAtLogin);
}

/**
 * 应用准备就绪
 * * 创建窗口 *
 * * 创建托盘图标 *
 * * 创建菜单 *
 */
function ready() {
  createWindow();
  createTray();
  createMenu();
}

/**
 * 创建窗口
 */
function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
    },
  });

  if (app.isPackaged) {
    win.loadFile(join(app.getAppPath(), "dist/index.html"));
  } else {
    win.loadURL(env.VITE_DEV_SERVER_URL);
  }
}

/**
 * 创建托盘栏图标
 */
function createTray() {
  const tray = new Tray(join(app.getAppPath(), app.isPackaged ? "dist/favicon-512x512.png" : "public/favicon-512x512.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "退出",
      click() {
        app.quit();
      },
    },
  ]);
  tray?.setContextMenu(contextMenu);
  tray?.setToolTip("工具箱");
}

/**
 * 创建主菜单
 */
function createMenu() {
  Menu.setApplicationMenu(app.isPackaged
    ? null
    : Menu.buildFromTemplate([
      {
        label: "开发者工具",
        accelerator: "F12",
        click(
          item: MenuItem,
          focusedWindow: BrowserWindow | undefined,
        ) {
          if (focusedWindow) {
            focusedWindow.webContents.openDevTools();
          }
        },
      },
    ]),
  );
}

/**
 * 修改了配置, 对应对程序做处理
 * @param key 修改的key
 * @param value 修改后的值
 */
function configProcess(key: string, value: string) {
  switch (key) {
    case "openAtLogin":
      // 修改了 <开机自启> 设置
      app.setLoginItemSettings({
        openAtLogin: value === "true",
      });
      break;
    case "allowPrerelease":
      autoUpdater.allowPrerelease = value === "true";
      break;
    default:
      break;
  }
}

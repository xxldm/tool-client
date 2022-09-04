import { type MenuItem, app, BrowserWindow, ipcMain, Menu, Tray } from "electron";
import Store from "electron-store";
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

app.whenReady().then(ready);

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
  initIpc();
}

let win: BrowserWindow | null = null;

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
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
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

function initIpc() {
  initStoreIpc();
  initSystemIpc();
}

function initStoreIpc() {
  const store = new Store<Record<string, string>>();
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

function initSystemIpc() {
  ipcMain.on("getPlatform", event => event.returnValue = platform);
  ipcMain.handle("closeApp", () => app.quit());
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
    default:
      break;
  }
}

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") {
    app.quit();
  }
});

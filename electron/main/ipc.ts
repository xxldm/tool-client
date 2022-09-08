import { app, autoUpdater, ipcMain, nativeTheme, platform, screen, store, window } from ".";
import { createWindow, maximize } from "./window";
/**
 * 初始化通讯
 */
export function initIpc() {
  initStoreIpc();
  initSystemIpc();
}

/**
 * 修改了配置, 对应对程序做处理
 * @param key 修改的key
 * @param value 修改后的值
 */
export function configProcess(key: string, oldValue: string, value: string) {
  switch (key) {
    case "openAtLogin":
      // 修改了 <开机自启> 设置
      app.setLoginItemSettings({
        openAtLogin: value === "true",
      });
      break;
    case "allowPrerelease":
      // 修改自动更新是否获取预览版
      autoUpdater.allowPrerelease = value === "true";
      break;
    case "themeSource":
      // 修改主题模式
      if (value === "auto") {
        nativeTheme.themeSource = "system";
        break;
      }
      nativeTheme.themeSource = value as "light" | "dark";
      break;
    case "isNormal":
      // 修改窗口模式
      if (value !== oldValue) {
        createWindow();
      }
      break;
    case "displayIndex":
      // 修改窗口模式
      if (value !== oldValue) {
        maximize(window.win, Number(value));
      }
      break;
    default:
      break;
  }
}

/**
 * 初始化程序方面的通讯
 */
function initSystemIpc() {
  ipcMain.on("getPlatform", event => event.returnValue = platform);
  ipcMain.on("isPackage", event => event.returnValue = app.isPackaged);
  ipcMain.on("getDisplayCount", event => event.returnValue = screen.getAllDisplays().length);
  ipcMain.handle("closeApp", () => app.quit());
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
      const oldValue = store.get(arg[0]);
      event.returnValue = store.set(arg[0], arg[1]);
      configProcess(arg[0], oldValue, arg[1]);
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
      const oldValue = store.get(arg[0]);
      store.set(arg[0], arg[1]);
      return configProcess(arg[0], oldValue, arg[1]);
    },
  );
  // 配置文件写入
  ipcMain.handle("removeItemAsync",
    (event, arg: string[]) => store.delete(arg[0]),
  );
}

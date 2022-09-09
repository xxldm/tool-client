import { type BrowserWindowConstructorOptions, BrowserWindow } from "electron";
import { join } from "path";

import { app, env, isDebug, screen, store, window } from ".";

/**
 * 创建窗口
 */
export async function createWindow() {
  const isNormal = store.get("isNormal", "true") === "true";
  let newWindow;
  const config: BrowserWindowConstructorOptions = {};
  // true 创建正常窗口 false 创建全屏无边框窗口
  if (isNormal) {
    // 获取保存的窗口参数
    const x = store.get("window.x");
    const y = store.get("window.y");
    const width = store.get("window.width");
    const height = store.get("window.height");
    const maximizable = store.get("window.maximizable", "false");
    if (x) {
      config.x = Number(x);
    }
    if (y) {
      config.y = Number(y);
    }
    if (width) {
      config.width = Number(width);
    }
    if (height) {
      config.height = Number(height);
    }
    // 创建窗口
    newWindow = new BrowserWindow({
      ...config,
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
      },
    });
    maximizable === "true" ? newWindow.maximize() : newWindow.unmaximize();
    // 监听窗口大小变化, 保存参数
    newWindow.on("resize", debounceSaveBounds());
    // 监听窗口最大化, 保存参数
    newWindow.on("maximize", () => {
      store.set("window.maximizable", "true");
    });
    // 监听退出窗口最大化, 保存参数
    newWindow.on("unmaximize", () => {
      store.set("window.maximizable", "false");
    });
    // 监听窗口位置变化, 保存参数
    newWindow.on("move", debounceSaveBounds());
  } else {
    const { getElectronWindowHandle, getProgmanHandle, removeMouseAndKeyboardListener, setParentToDesktop } = await import("./win32");
    // 无边框
    config.frame = false;
    newWindow = new BrowserWindow({
      ...config,
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
      },
    });
    newWindow.on("closed", () => {
      // 壁纸模式窗口被关闭,检查模式有没有发生改变
      const isNormal = store.get("isNormal", "true") === "true";
      if (isNormal) {
        // 模式改变了, 移除监听
        removeMouseAndKeyboardListener();
      } else {
        if (getProgmanHandle() > 0) {
          app.quit();
        } else {
          window.win = undefined;
          const reopen = () => {
            if (getProgmanHandle() > 0) {
              createWindow();
            } else {
              setTimeout(reopen, 1000);
            }
          };
          setTimeout(reopen, 1000);
        }
      }
    });
    newWindow.webContents.on("before-input-event", (_event, input) => {
      window.win?.webContents.setIgnoreMenuShortcuts(input.key === "F4" && input.alt);
    });
    setParentToDesktop(getElectronWindowHandle(newWindow));
    const displayIndex = Number(store.get("displayIndex"));
    // 最大化
    maximize(newWindow, displayIndex);
  }

  // 关闭老窗口
  if (window.win) {
    window.win.close();
  }

  // 绑定新窗口
  window.win = newWindow;

  if (!isDebug && app.isPackaged) {
    window.win.loadFile(join(app.getAppPath(), "dist/index.html"));
  } else {
    window.win.loadURL(env.VITE_DEV_SERVER_URL);
  }
}

export function maximize(win: BrowserWindow | undefined, screenIndex: number) {
  if (!win) {
    return;
  }
  let display;
  if (screenIndex !== -1) {
    display = screen.getAllDisplays()[screenIndex];
  } else {
    display = screen.getPrimaryDisplay();
  }
  win.resizable = true;
  // animate参数仅mac, windows可以手动加个过渡动画
  win.setBounds(display.workArea);
  win.resizable = false;
}

function debounceSaveBounds() {
  let timer: NodeJS.Timeout | undefined;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(saveBounds, 200);
  };
}

function saveBounds() {
  const bounds = window.win!.getNormalBounds();
  store.set("window.width", bounds.width);
  store.set("window.height", bounds.height);
  store.set("window.x", bounds.x);
  store.set("window.y", bounds.y);
}

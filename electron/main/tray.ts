import { Menu, Tray } from "electron";
import { join } from "path";

import { app } from ".";

/**
 * 创建托盘栏图标
 */
export function createTray() {
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

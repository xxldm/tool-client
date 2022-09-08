import type { BrowserWindow, MenuItem } from "electron";
import { Menu } from "electron";

/**
 * 创建主菜单
 */
export function createMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
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

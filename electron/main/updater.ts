import type { CancellationToken, ProgressInfo, UpdateInfo } from "electron-updater";
import { join } from "path";

import { app, autoUpdater, ipcMain, isDebug, store, window } from ".";

/**
 * 初始化自动更新程序
 */
export const initUpdater = () => {
  let cancellationToken: CancellationToken | undefined;
  if (isDebug) {
    autoUpdater.updateConfigPath = join(app.getAppPath(), "app-update.yml");
  }
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
    window.win?.webContents.send("updateAvailable", updateInfo),
  );
  // 没有更新，通知页面
  autoUpdater.on("update-not-available", () =>
    window.win?.webContents.send("updateNotAvailable"),
  );
  // 页面调用下载更新
  ipcMain.handle("downloadUpdate", () => {
    autoUpdater.downloadUpdate(cancellationToken).catch();
  });
  // 页面调用取消下载
  ipcMain.handle("cancelDownloadUpdate", () => cancellationToken?.cancel());
  autoUpdater.on("update-cancelled", (updateInfo: UpdateInfo) =>
    window.win?.webContents.send("updateCancelled", updateInfo),
  );
  // 开始下载，监听下载进度
  autoUpdater.on("download-progress", (progress: ProgressInfo) => {
    window.win?.webContents.send("downloadProgress", progress);
  });
  // 下载完毕
  autoUpdater.on("update-downloaded", () =>
    window.win?.webContents.send("downloadDownloaded"),
  );
  // 立即更新，如果没有调用这个方法，应用会在手动关闭后自动更新
  ipcMain.handle("quitAndInstall", () => autoUpdater.quitAndInstall(true, true));
  // 更新出错
  autoUpdater.on("error", (error: Error) =>
    window.win?.webContents.send("updateError", error),
  );
};

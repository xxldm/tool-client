// 判断是否是 electron 环境
export const isElectron
  = typeof navigator === "object" && navigator.userAgent.includes("Electron");
export const isPackage = window.electron?.isPackage();
// 平台检查
export const getPlatform = window.electron?.getPlatform;
// 关闭应用
export const closeApp = window.electron?.closeApp;
// 获取版本
export const getCurrentVersion = window.electron?.getCurrentVersion;
// 检查更新
export const checkUpdate = window.electron?.checkUpdate;
// 有更新
export const updateAvailable = window.electron?.updateAvailable;
// 无更新
export const updateNotAvailable = window.electron?.updateNotAvailable;
// 开始下载更新
export const downloadUpdate = window.electron?.downloadUpdate;
// 取消下载更新
export const cancelDownloadUpdate = window.electron?.cancelDownloadUpdate;
// 取消了下载
export const updateCancelled = window.electron?.updateCancelled;
// 更新下载进度
export const downloadProgress = window.electron?.downloadProgress;
// 更新下载完成
export const downloadDownloaded = window.electron?.downloadDownloaded;
// 关闭并更新
export const quitAndInstall = window.electron?.quitAndInstall;
// 更新出错
export const updateError = window.electron?.updateError;


export const isElectron
  = typeof navigator === "object" && navigator.userAgent.includes("Electron");

export const getPlatform = () => window.electron.getPlatform();

export const closeApp = () => window.electron.closeApp();

export const useSettingsStore = defineStore("my-settings", () => {
  const openAtLogin = useStorageAsync("openAtLogin", false, myStorageAsync);
  const allowPrerelease = useStorageAsync("allowPrerelease", false, myStorageAsync);
  const isNormal = useStorageAsync("isNormal", true, myStorageAsync);
  const displayIndex = useStorageAsync("displayIndex", -1, myStorageAsync);
  return {
    openAtLogin,
    allowPrerelease,
    isNormal,
    displayIndex,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}

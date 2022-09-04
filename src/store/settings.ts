export const useSettingsStore = defineStore("my-settings", () => {
  const openAtLogin = useStorageAsync("openAtLogin", false, myStorageAsync);
  const allowPrerelease = useStorageAsync("allowPrerelease", false, myStorageAsync);
  return {
    openAtLogin,
    allowPrerelease,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}

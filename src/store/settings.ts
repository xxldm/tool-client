export const useSettingsStore = defineStore("my-settings", () => {
  const openAtLogin = useStorageAsync("openAtLogin", false, myStorageAsync);
  return {
    openAtLogin,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}

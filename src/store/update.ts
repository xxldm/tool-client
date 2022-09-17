export const useUpdateStore = defineStore("update", () => {
  const showDialog = ref(false);
  const newVersion = ref(false);
  const loading = ref(false);
  const downloading = ref(false);
  const downloaded = ref(false);
  const currentVersion = getCurrentVersion();
  const skipVersion = useStorageAsync<string | undefined>("skipVersion", undefined, myStorageAsync);
  const errorMessage = ref<string | undefined>();

  return {
    showDialog,
    newVersion,
    loading,
    downloading,
    downloaded,
    currentVersion,
    skipVersion,
    errorMessage,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUpdateStore, import.meta.hot));
}

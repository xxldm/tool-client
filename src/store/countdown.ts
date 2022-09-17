export const useCountdownStore = defineStore("countdown", () => {
  return {
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCountdownStore, import.meta.hot));
}

import { defaultLocale, setLocale } from "~/modules/i18n";

export const useLocaleStore = defineStore("my-locale", () => {
  const locale = useStorageAsync("locale", defaultLocale, myStorageAsync);
  const elLocale = computedAsync(() => setLocale(locale.value));
  return {
    locale,
    elLocale,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLocaleStore, import.meta.hot));
}

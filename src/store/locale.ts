import type { Language } from "element-plus/es/locale";

import { defaultLocale } from "~/modules/i18n";

export const useLocaleStore = defineStore("my-locale", () => {
  const locale = useStorage("locale", defaultLocale, myStorage);
  const elLocale: Language | undefined = undefined;
  return {
    locale,
    elLocale,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLocaleStore, import.meta.hot));
}

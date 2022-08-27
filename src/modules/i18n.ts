import { createI18n } from "vue-i18n";

export const defaultLocale = useLocalStorage("locale", "zh-cn").value;

export const supportLocales = [{
  name: "简体中文",
  locale: "zh-cn",
}, {
  name: "English",
  locale: "en",
}];

const i18n = createI18n({
  legacy: false,
  // 找不到翻译，回退的默认翻译
  fallbackLocale: defaultLocale,
});

// 加载语言文件
async function loading(locale: string): Promise<void> {
  return Promise.all([
    import(`../locales/${locale}.yaml`),
    import(`../locales/element-plus/${locale}.ts`),
  ]).then(([myLocale, elLocale]) => {
    // 更新 element plus 的国际化，每次都需要覆盖
    useLocaleStore().elLocale = elLocale.default;
    useLocaleStore().locale = locale;
    // 如果 vue-i18n 国际化中没有加载过当前语言，加载一次
    if (!i18n.global.availableLocales.includes(locale)) {
      i18n.global.setLocaleMessage(locale, myLocale.default);
    }
  });
}

// 设置语言
export function setLocale(locale: string): Promise<void> {
  return loading(locale).then(() => {
    // axios 添加国际化头
    axios.defaults.headers.common["Accept-Language"] = locale;
    // 修改 vue-i18n 当前生效语言
    i18n.global.locale.value = locale;
  });
}

export const t = i18n.global.t;

export default i18n;

import type { Language } from "element-plus/es/locale";
import { createI18n } from "vue-i18n";

export const defaultLocale = "zh-cn";

interface Locale {
  [key: string]: {
    locale: string
    name: string
    myLocale: Function
    elementPlus: Function
  }
}

const i18n = createI18n({
  legacy: false,
  // 找不到翻译，回退的默认翻译
  fallbackLocale: defaultLocale,
});

export const supportLocales: Locale = {
  "zh-cn": {
    locale: "zh-cn",
    name: "中文",
    myLocale: () => import("~/locales/zh-cn.json"),
    elementPlus: () => import("element-plus/lib/locale/lang/zh-cn"),
  },
  "en": {
    locale: "en",
    name: "English",
    myLocale: () => import("~/locales/en.json"),
    elementPlus: () => import("element-plus/lib/locale/lang/en"),
  },
};

// 加载语言文件
async function loading(locale: string): Promise<Language> {
  return Promise.all([
    supportLocales[locale].myLocale(),
    supportLocales[locale].elementPlus(),
  ]).then(([myLocale, elLocale]) => {
    // 如果 vue-i18n 国际化中没有加载过当前语言，加载一次
    if (!i18n.global.availableLocales.includes(locale)) {
      i18n.global.setLocaleMessage(locale, myLocale.default);
    }
    // 返回 element plus 的国际化
    return elLocale.default;
  });
}

// 设置语言
export async function setLocale(locale: string): Promise<Language> {
  const elLocale = await loading(locale);
  // axios 添加国际化头
  axios.defaults.headers.common["Accept-Language"] = locale;
  // 修改 vue-i18n 当前生效语言
  i18n.global.locale.value = locale;
  return elLocale;
}

export const t = i18n.global.t;

export default i18n;

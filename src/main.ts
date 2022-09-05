import "@unocss/reset/normalize.css";
import "github-markdown-css/github-markdown.css";
import "./styles/main.scss";
import "uno.css";

import { type Plugin, createApp } from "vue";

import App from "./App.vue";

const app = createApp(App);

Object.values(import.meta.glob<{ default: Plugin }>("./modules/*.ts", { eager: true }))
  .forEach(i => app.use(i.default));

// 等待i18n加载, 避免页面优先加载, i18n还没加载, 导致控制台i18n key找不到的警告刷屏
watchOnce(() => useLocaleStore().elLocale, async () => {
  await nextTick();
  app.mount("#app");
});


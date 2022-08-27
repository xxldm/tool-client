import "@unocss/reset/normalize.css";
import "./styles/main.scss";
import "uno.css";

import { type Plugin, createApp } from "vue";

import App from "./App.vue";
import { defaultLocale, setLocale } from "./modules/i18n";

const app = createApp(App);

Object.values(import.meta.glob<{ default: Plugin }>("./modules/*.ts", { eager: true }))
  .forEach(i => app.use(i.default));

await setLocale(defaultLocale);

app.mount("#app");

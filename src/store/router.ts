import { routes } from "~/modules/router";

export const useRouterStore = defineStore("my-router", () => {
  const routes_menu = useArrayFilter(routes, route => !route.children![0].meta?.hidden);
  return {
    routes_menu,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRouterStore, import.meta.hot));
}

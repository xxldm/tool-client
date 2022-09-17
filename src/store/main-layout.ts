import type { Component } from "vue";

export interface ComponentLayout {
  time: number
  componentName: string
  inBox: boolean
  mode: "horizontal" | "vertical"
  colSpan: number
  rowSpan: number
}

export interface MainLayout {
  row: number
  col: number
  gap: number
  componentLayouts: ComponentLayout[]
}

const layout = useStorage<MainLayout>("main-layout", {
  row: 5,
  col: 4,
  gap: 4,
  componentLayouts: [] as ComponentLayout[],
}, myStorage);

const viewComponents = process(import.meta.glob("~/components/main-view/*.vue"));

function process(data: Record<string, () => Promise<{ [p: string]: any }>>) {
  return Object.entries(data).reduce<Record<string, Component>>((viewComponents, module) => {
    let moduleName = module[0];
    // 截取最后一个/后面的文件名
    moduleName = moduleName.substring(moduleName.lastIndexOf("/") + 1);
    // 去掉后缀
    moduleName = moduleName.substring(0, moduleName.lastIndexOf("."));
    if (moduleName === "MainLayoutBox") {
      return viewComponents;
    }
    viewComponents[moduleName] = defineAsyncComponent(module[1]);
    return viewComponents;
  }, {});
}

export const useMainLayoutStore = defineStore("main-layout", {
  state: () => ({ edit: false, ...resolveUnref(JSON.parse(myStorage.getItem("main-layout") || "{}") as MainLayout) }),
  getters: {
    isEdit: state => state.edit,
    viewComponents: () => viewComponents,
    getComponentLayouts: state => state.componentLayouts.slice(0, state.col * state.row),
    getComponentByName: () => (name: string) => viewComponents[name],
    getComponentLayoutByIndex: state => (index: number) => state.componentLayouts[index] || {},
  },
  actions: {
    add() {
      this.componentLayouts.push({
        time: new Date().getTime(),
        componentName: "",
        inBox: true,
        mode: "horizontal",
        colSpan: 1,
        rowSpan: 1,
      });
    },
    remove(index: number) {
      this.componentLayouts.splice(index, 1);
    },
    save() {
      Object.assign(layout.value, this.$state);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMainLayoutStore, import.meta.hot));
}

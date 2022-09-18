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

export const useMainLayoutStore = defineStore("main-layout", () => {
  // 编辑状态
  const edit = ref(false);
  // 布局配置
  const state = ref(initData());
  // 首页可用组件列表
  const viewComponents = computed(() => process(import.meta.glob("~/components/main-view/*.vue")));
  const { row, col, gap } = toRefs(state.value);
  // 是否编辑
  const isEdit = computed(() => edit.value);
  // 根据设定表格大小, 获取最后一个可显示的设定组件下标 和 所有可显示的设定组件占据空间
  const showInfo = computed(() => {
    // 加载内容下标
    let index = 0;
    // 已加载内容所占格数
    let occupyCount = 0;
    // 首页总格数
    const allCount = state.value.col * state.value.row;
    // 加载内容
    for (; index < state.value.componentLayouts.length; index++) {
      // 待加载内容
      const componentLayout = state.value.componentLayouts[index];
      // 加载后所占格数
      occupyCount += componentLayout.colSpan * componentLayout.rowSpan;
      // 如果加载后所占格数 大于 总格数, 不加载剩下的内容
      if (occupyCount > allCount) {
        // 因为内容所需格数 大于 总格数, 所以去掉最后一个内容
        index--;
        break;
      }
    }
    return { index, occupyCount };
  });
  // 所有可显示的设定组件占据空间
  const occupyCount = computed(() => showInfo.value.occupyCount);
  // 所有可显示的设定组件
  const componentLayouts = computed(() => state.value.componentLayouts.slice(0, showInfo.value.index + 1));

  // 根据组件名称获取组件对象
  function getComponentByName(name: string) {
    return viewComponents.value[name];
  }
  // 重置配置信息为保存内容
  function $reset() {
    Object.assign(state.value, initData());
  }
  // 保存配置信息
  function save() {
    Object.assign(layout.value, state.value);
  }
  // 删除一个组件
  function remove(index: number) {
    state.value.componentLayouts.splice(index, 1);
  }
  // 添加一个组件
  function add() {
    state.value.componentLayouts.push({
      time: new Date().getTime(),
      componentName: "",
      inBox: true,
      mode: "horizontal",
      colSpan: 1,
      rowSpan: 1,
    });
  }
  // 从保存初始化配置
  function initData() {
    return JSON.parse(myStorage.getItem("main-layout") || "{}") as MainLayout;
  }
  // 处理可用组件格式
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
  return {
    edit,
    isEdit,
    row,
    col,
    gap,
    viewComponents,
    occupyCount,
    componentLayouts,
    $reset,
    getComponentByName,
    add,
    remove,
    save,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMainLayoutStore, import.meta.hot));
}

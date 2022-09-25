import type { Component } from "vue";

export interface ComponentLayout {
  time: number
  order: number
  col?: number
  colSpan: number
  row?: number
  rowSpan: number
  componentName: string
  inBox: boolean
  mode: "horizontal" | "vertical"
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
  // 所有可显示的设定组件占据空间
  const occupyCount = ref(0);
  // 布局配置
  const { row, col, gap } = toRefs(state.value);
  // 所有可显示的设定组件
  const componentLayouts = computed(() => {
    // 清空占用空间
    occupyCount.value = 0;
    // 清空,首页可显示的组件列表
    const componentLayouts = [] as ComponentLayout[];
    // 每行剩余空间
    const colContentLengths = Array.from<number>({ length: row.value })
      .reduce<number[]>((l) => {
        l[l.length] = col.value;
        return l;
      }, []);
    // 加载内容
    for (let index = 0; index < state.value.componentLayouts.length; index++) {
      // 加载内容所在行
      let row;
      // 加载内容所在列
      let col;
      // 待加载对象
      const cl = state.value.componentLayouts[index];
      for (let i = 0; i < state.value.row; i++) {
        // 判断哪一行放的下
        if (colContentLengths[i] >= cl.colSpan) {
          // 设置行
          row = i;
          // 设置列
          col = state.value.row - colContentLengths[i];
          // 如果跨行,减少所有行的剩余空间
          for (let j = 0; j < cl.rowSpan; j++) {
            // 减少行的剩余空间
            colContentLengths[i + j] -= cl.colSpan;
          }
          // 如果行合并, 大于剩余行
          if (cl.rowSpan > state.value.row - i) {
            // 修改为剩余行
            cl.rowSpan = state.value.row - i;
          }
          break;
        }
      }
      // 行列不为空
      if (row !== undefined && col !== undefined) {
        // 保存信息
        cl.col = col;
        cl.row = row;
        occupyCount.value += cl.colSpan * cl.rowSpan;
        // 插入页面显示集合
        componentLayouts.push(cl);
      }
    }
    return componentLayouts;
  });
  // 是否编辑
  const isEdit = computed(() => edit.value);

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
      order: state.value.componentLayouts.length + 1,
      colSpan: 1,
      rowSpan: 1,
      componentName: "",
      mode: "horizontal",
      inBox: true,
    });
  }
  // 从保存初始化配置
  function initData() {
    const data = JSON.parse(myStorage.getItem("main-layout") || "{}") as MainLayout;
    // 给组件列表按用户设置order排序
    data.componentLayouts.sort((cl, cl2) => cl.order - cl2.order);
    return data;
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

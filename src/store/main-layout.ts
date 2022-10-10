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
      .reduce<{ index: number; length: number }[][]>((l) => {
        l[l.length] = [{ index: 0, length: col.value }];
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
      let isOk = false;
      for (let i = 0; i < state.value.row; i++) {
        // 剩余空间分段
        for (let j = 0; j < colContentLengths[i].length; j++) {
          // 每段 index:开始下标 length:该段连续长度
          const data = colContentLengths[i][j];
          // 判断是否放得下
          if (data.length >= cl.colSpan) {
            // 成功添加
            isOk = true;
            // 设置行
            row = i;
            // 设置列
            col = data.index;
            // 如果行合并, 大于剩余行
            if (cl.rowSpan > state.value.row - i) {
              // 修改为剩余行
              cl.rowSpan = state.value.row - i;
            }
            // 减少当前行的剩余空间
            data.index += cl.colSpan;
            data.length -= cl.colSpan;
            // 不跨行
            if (cl.rowSpan === 1) {
              break;
            }
            // 最后一行
            if (i + 1 === colContentLengths.length) {
              break;
            }
            // 如果跨行,减少其余行的剩余空间
            for (let y = 0; y < colContentLengths[i + 1].length; y++) {
              const d = colContentLengths[i + 1][y];
              // 连续空间,开始点在当前控件之前,并且连续空间大于当前控件所需空间
              // d.length 连续空间大小
              // col - d.index 当前控件开始位置 - 连续空间开始位置
              // d.length - (col - d.index) 真实可用连续空间
              if (d.index <= col && d.length - (col - d.index) >= cl.colSpan) {
                // 找到了,减少所有行对于空间
                // 开始位置一致
                if (d.index === col) {
                  // 长度用完了,直接删除连续空间
                  if (d.length === cl.colSpan) {
                    // 理论上后面行只会比前面行空余更多, 所以跳过判断, 直接操作
                    for (let x = 1; x < cl.rowSpan; x++) {
                      colContentLengths[i + x].splice(y, 1);
                    }
                  } else {
                    // 理论上后面行只会比前面行空余更多, 所以跳过判断, 直接操作
                    for (let x = 1; x < cl.rowSpan; x++) {
                      // 没用完修改起点和长度
                      colContentLengths[i + x][y].index += cl.colSpan;
                      // 减少行的剩余空间
                      colContentLengths[i + x][y].length -= cl.colSpan;
                    }
                  }
                } else {
                  // 开始位置不一致
                  if (d.length - (col - d.index) === cl.colSpan) {
                    // 结尾位置一致
                    // 理论上后面行只会比前面行空余更多, 所以跳过判断, 直接操作
                    for (let x = 1; x < cl.rowSpan; x++) {
                      colContentLengths[i + x][y].length -= cl.colSpan;
                    }
                  } else {
                    // 连续空间处理前长度
                    const tempLength = d.length;
                    // 开始结尾都不一致, 拆开连续空间
                    for (let x = 1; x < cl.rowSpan; x++) {
                      // 前半长度改成截至控件位置
                      colContentLengths[i + x][y].length = col - d.index;
                      // 后半段,添加一个,{index:控件结束位置,length:原始长度-控件结束位置}
                      colContentLengths[i + x].splice(y + 1, 0, {
                        index: col + cl.colSpan,
                        length: tempLength - (col + cl.colSpan),
                      });
                    }
                  }
                }
                // 找到了,跳出循环
                break;
              }
            }
            break;
          }
        }
        if (isOk) {
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
    sort(data.componentLayouts);
    return data;
  }

  /**
   * 修改顺序
   * @param start 开始位置
   * @param end 结束位置
   * @param change 增值
   * @param _this 发起修改本体
   */
  function order(start: number, end: number, change: number, _this: ComponentLayout) {
    const changeCLs = state.value.componentLayouts.slice(start, end);
    changeCLs.forEach((cl) => {
      if (_this.time !== cl.time) {
        cl.order += change;
      }
    });
  }

  /**
   * 排序
   */
  function sort(componentLayouts?: ComponentLayout[]) {
    // 给组件列表按用户设置order排序
    if (componentLayouts) {
      componentLayouts.sort((cl, cl2) => cl.order - cl2.order);
    } else {
      state.value.componentLayouts.sort((cl, cl2) => cl.order - cl2.order);
    }
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
    order,
    sort,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMainLayoutStore, import.meta.hot));
}

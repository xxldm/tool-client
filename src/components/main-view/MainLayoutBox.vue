<template>
  <div
    ref="box"
    relative
    flex
    justify-center
    items-center
    :col-span="componentLayout.colSpan"
    :row-span="componentLayout.rowSpan"
  >
    <template v-if="componentLayout.inBox">
      <el-card
        w-full
        h-full
        flex="~ col"
        :class="componentLayout.mode === 'horizontal' ? 'justify-center' : 'items-center'"
        overflow-hidden
        :body-style="componentLayout.mode === 'horizontal' ? {} : { height: 'calc(100% - var(--el-card-padding) * 2)' }"
      >
        <el-scrollbar>
          <component
            :is="mainLayoutStore.getComponentByName(componentLayout.componentName)"
            :mode="componentLayout.mode"
          />
        </el-scrollbar>
      </el-card>
    </template>
    <template v-else>
      <div
        w-full
        h-full
        flex="~ col"
        :class="componentLayout.mode === 'horizontal' ? 'justify-center' : 'items-center'"
        overflow-hidden
      >
        <div
          :class="componentLayout.mode === 'horizontal' ? '' : 'h-full'"
        >
          <el-scrollbar>
            <component
              :is="mainLayoutStore.getComponentByName(componentLayout.componentName)"
              :mode="componentLayout.mode"
            />
          </el-scrollbar>
        </div>
      </div>
    </template>
    <div
      v-if="mainLayoutStore.isEdit"
      class="editBox"
      :style="position"
    >
      <div>
        <div>
          内容:
          <el-select
            v-model="componentLayout.componentName"
            size="small"
            w-20
          >
            <el-option
              label="空白"
              value=""
            />
            <el-option
              v-for="_, key of mainLayoutStore.viewComponents"
              :key="key"
              :label="t(`mainLayout.component.label.${key}`)"
              :value="key"
            />
          </el-select>
        </div>
        <div>
          跨行:
          <el-input-number
            v-model="componentLayout.rowSpan"
            size="small"
            step-strictly
            w-22
            :min="1"
            :max="mainLayoutStore.row - componentLayout.row!"
          />
        </div>
        <div>
          卡片:
          <el-switch
            v-model="componentLayout.inBox"
            size="small"
          />
        </div>
        <div>
          跨列:
          <el-input-number
            v-model="componentLayout.colSpan"
            size="small"
            step-strictly
            w-22
            :min="1"
            :max="9"
          />
        </div>
        <div>
          模式:
          <el-switch
            v-model="componentLayout.mode"
            size="small"
            active-text="水平"
            active-value="horizontal"
            inactive-text="垂直"
            inactive-value="vertical"
          />
        </div>
        <div>
          排序:
          <el-input-number
            v-model="componentLayout.order"
            size="small"
            step-strictly
            w-22
            :min="1"
            :max="81"
            @change="onChangeOrder"
          />
        </div>
        <div
          i-carbon-close
          style="color: var(--el-color-info);"
          text-5
          absolute
          top-0
          right-0
          cursor-pointer
          @click="mainLayoutStore.remove(componentLayoutIndex)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const prop = defineProps<{
  componentLayoutIndex: number
  box: HTMLElement
}>();

const { t } = useI18n();

const box = ref<HTMLElement>();

const mainLayoutStore = useMainLayoutStore();

const componentLayout = computed(() => mainLayoutStore.componentLayouts[prop.componentLayoutIndex]);

// 外层壳子
const mainBox = computed(() => prop.box);
// 外层壳子边界信息
const boxBounding = useElementBounding(mainBox);
// 编辑浮层边界信息
const editBoxBounding = useElementBounding(box);

const status = ref(false);

useRafFn(() => {
  if (box.value?.className) {
    status.value = true;
  } else if (status.value) {
    editBoxBounding.update();
    status.value = false;
  }
});

const onChangeOrder = (val: number | undefined, oldVal: number | undefined) => {
  if (val === undefined || oldVal === undefined) {
    return;
  }
  if (val > oldVal) {
    // val 目标 order, -1 目标下标, +1 slice不包含结束下标, 最终 +0
    // oldVal 本体 order, -1 本体下标, +1 后一个, 最终 +0
    mainLayoutStore.order(oldVal, val, -1, componentLayout.value);
  } else {
    // val 目标 order, -1 目标下标, 最终 -1
    // oldVal 本体 order, -1 本地下标, slice不包含结束下标, 所以不会包含本体, 最终 -1
    mainLayoutStore.order(val - 1, oldVal - 1, 1, componentLayout.value);
  }
  mainLayoutStore.sort();
};

const position = computed(() => {
  let result = "";
  if (editBoxBounding.left.value - boxBounding.left.value < editBoxBounding.width.value) {
    result += "left: 0px;";
  }
  if (editBoxBounding.top.value - boxBounding.top.value < editBoxBounding.height.value) {
    result += "top: -1px;";
  }
  if (boxBounding.right.value - editBoxBounding.right.value < editBoxBounding.width.value) {
    result += "right: 0px;";
  }
  if (boxBounding.bottom.value - editBoxBounding.bottom.value < editBoxBounding.height.value) {
    result += "bottom: -1px;";
  }
  return result;
});
</script>

<style lang="scss" scoped>
.editBox {
  >div {
    --at-apply: grid grid-gap-2 grid-cols-2 min-w-75;
    >div {
      --at-apply: flex flex-gap-2 items-center;
    }
  }
  .el-input-number--small {
    --at-apply: lh-1
  }
  border-color: var(--el-border-color);
  background-color: var(--el-bg-color);
  width: calc(100% - 0.125rem);
  --at-apply: b-rd-1 b-1 h-full z-1 transition-all-500 absolute opacity-10 overflow-hidden flex justify-center items-center select-none;
}
.editBox:hover {
  width: max(18.75rem, calc(100% - 2.125rem));
  height: max(5.625rem, calc(100% - 2rem));
  --at-apply: z-2 p-4 opacity-80;
}
</style>

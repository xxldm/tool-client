<template>
  <div
    ref="editBox"
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
        <div>
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
            w-18
            :min="1"
            :max="9"
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
            w-18
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
import type { Ref } from "vue";

const prop = defineProps<{
  componentLayoutIndex: number
  box: any
}>();

const { t } = useI18n();

const editBox = ref();

const mainLayoutStore = useMainLayoutStore();

const componentLayout = computed(() => mainLayoutStore.componentLayouts[prop.componentLayoutIndex]);

// 外层壳子
const box = computed(() => prop.box);
// 外层壳子边界信息
const boxBounding = useElementBounding(box);
// 编辑浮层边界信息
const editBoxBounding = useElementBounding(editBox);

onMounted(() => {
  // 新增动画需要0.5秒, 延迟0.5秒更新一次边界信息, 不更新会导致left值过小
  const { isPending, start, stop } = useTimeoutFn(() => {
    editBoxBounding.update();
  }, 500);
});

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
    min-width: 300px;
    --at-apply: grid grid-gap-2 grid-cols-2;
    >div {
      --at-apply: flex flex-gap-2 items-center;
    }
  }
  border-color: var(--el-border-color);
  border-radius: 4px;
  width: calc(100% - 2px);
  height: 100%;
  --at-apply: z-1 transition-all-500 absolute bg-gray-800 opacity-10 b-1 overflow-hidden flex justify-center items-center select-none;
}
.editBox:hover {
  padding: 16px;
  width: max(300px, calc(100% - 34px));
  height: max(90px, calc(100% - 32px));
  --at-apply: z-2 opacity-80;
}
</style>

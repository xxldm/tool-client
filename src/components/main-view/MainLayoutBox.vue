<template>
  <div
    relative
    flex
    justify-center
    items-center
    select-none
    :col-span="componentLayout.colSpan"
    :row-span="componentLayout.rowSpan"
  >
    <template v-if="componentLayout.inBox">
      <el-card
        h-full
        w-full
      >
        <component :is="mainLayoutStore.getComponentByName(componentLayout.componentName)" />
      </el-card>
    </template>
    <template v-else>
      <div
        h-full
        w-full
        overflow-hidden
      >
        <component
          :is="mainLayoutStore.getComponentByName(componentLayout.componentName)"
        />
      </div>
    </template>
    <div
      v-show="mainLayoutStore.isEdit"
      class="editBox"
      :style="prop.position"
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
          卡片:
          <el-switch
            v-model="componentLayout.inBox"
            size="small"
          />
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
        <div
          i-carbon-close
          style="color: var(--el-color-info);"
          text-5
          absolute
          top-0
          right-0
          cursor-pointer
          @click="mainLayoutStore.remove(prop.componentLayoutIndex)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const prop = withDefaults(defineProps<{
  componentLayoutIndex: number
  position: string
}>(), {
  position: "",
});

const { t } = useI18n();

const mainLayoutStore = useMainLayoutStore();

const componentLayout = mainLayoutStore.getComponentLayoutByIndex(prop.componentLayoutIndex);
</script>

<style lang="scss" scoped>
.editBox {
  >div {
    min-width: 260px;
    min-height: 60px;
    --at-apply: grid grid-rows-2 grid-flow-col items-center;
  }
  border-color: var(--el-border-color);
  border-radius: 4px;
  width: calc(100% - 2px);
  height: 100%;
  --at-apply: z-1 transition-all-500 absolute bg-gray-800 opacity-5 b-1 overflow-hidden flex justify-center items-center;
}
.editBox:hover {
  padding: 16px;
  width: max(260px, calc(100% - 34px));
  height: max(60px, calc(100% - 32px));
  --at-apply: z-2 opacity-80;
}
</style>

<template>
  <transition-group
    ref="box"
    tag="div"
    name="main-layout-box"
    h-full
    grid
    grid-flow-row-dense
    :grid-gap="mainLayoutStore.gap"
    :grid-cols="mainLayoutStore.col"
    :grid-rows="mainLayoutStore.row"
  >
    <main-layout-box
      v-for="componentLayout, index of mainLayoutStore.componentLayouts"
      :key="componentLayout.time"
      :component-layout-index="index"
      :box="box"
      :style="{ order: componentLayout.order }"
    />
    <template v-if="mainLayoutStore.isEdit">
      <template v-if="boxCount > 0">
        <div
          class="add-button"
          style="order: 98"
          @click="mainLayoutStore.add"
        >
          <div
            i-carbon-close
            style="transform:rotate(45deg);color: var(--el-color-info);"
            text-10
          />
        </div>
      </template>
      <template v-if="boxCount > 1">
        <div
          v-for="i of (boxCount - 1)"
          :key="i"
          style="order: 99"
          border-width-1
          b-dashed
          class="blank-box"
        />
      </template>
    </template>
  </transition-group>
</template>

<script setup lang="ts">
const mainLayoutStore = useMainLayoutStore();

const box = ref();

const boxCount = computed(() => {
  return mainLayoutStore.col * mainLayoutStore.row - mainLayoutStore.occupyCount;
});
</script>

<style lang="scss" scoped>
.add-button{
  --at-apply: border-width-1 b-dashed cursor-pointer flex items-center justify-center
}
.add-button, .blank-box {
  border-color: var(--el-border-color);
  border-radius: 4px;
}
.add-button:hover {
  background-color: var(--el-bg-color-overlay);
  box-shadow: var(--el-box-shadow-light);
}
.main-layout-box-move,
.main-layout-box-enter-active,
.main-layout-box-leave-active {
  transition: all 0.5s ease;
}
.main-layout-box-enter-from,
.main-layout-box-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
.main-layout-box-leave-active {
  position: absolute;
}
</style>

<route lang="yaml">
name: menu.main
meta:
  layout: main
</route>

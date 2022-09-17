<template>
  <transition-group
    tag="div"
    appear
    name="main-layout-box"
    h-full
    grid
    :grid-gap="mainLayoutStore.gap"
    :grid-cols="mainLayoutStore.col"
    :grid-rows="mainLayoutStore.row"
  >
    <main-layout-box
      v-for="componentLayout, index of mainLayoutStore.getComponentLayouts"
      :key="componentLayout.time"
      :component-layout-index="index"
      :position="getPosition(index)"
    />
    <template v-if="mainLayoutStore.isEdit">
      <template v-if="boxCount > 0">
        <div
          class="add-button"
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

const boxCount = computed(() => {
  let count = 0;
  for (const componentLayout of mainLayoutStore.getComponentLayouts) {
    count += componentLayout.colSpan * componentLayout.rowSpan;
  }
  return mainLayoutStore.col * mainLayoutStore.row - count;
});

const getPosition = (index: number) => {
  index++;
  let result = "";
  if (mainLayoutStore.col === 1 && mainLayoutStore.row === 1) {
    return result;
  }
  if (mainLayoutStore.col === 1) {
    if (index === 1) {
      result = "top: 0;";
    }
    if (index === mainLayoutStore.row) {
      result = "bottom: 0;";
    }
    return result;
  }
  if (mainLayoutStore.row === 1) {
    if (index === 1) {
      result = "left: 0;";
    }
    if (index === mainLayoutStore.col) {
      result = "right: 0;";
    }
    return result;
  }
  if (index <= mainLayoutStore.col) {
    result += "top: 0;";
  }
  if (index > 0 && index % mainLayoutStore.col === 0) {
    result += "right: 0;";
  }
  if (index === 0 || index % mainLayoutStore.col === 1) {
    result += "left: 0;";
  }
  if (index > mainLayoutStore.col * (mainLayoutStore.row - 1)) {
    result += "bottom: 0;";
  }
  return result.slice(0, result.length - 1);
};
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

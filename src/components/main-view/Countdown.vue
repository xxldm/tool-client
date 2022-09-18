<template>
  <div
    flex="~ gap-4"
    items-center
    style="width: max-content;"
  >
    <el-card
      v-for="i of 10"
      :key="i"
      shadow="never"
    >
      <div
        flex="~ gap-4 col"
        items-center
      >
        <div text-8>
          国庆节
        </div>
        <div>
          {{ formatDiff(now, new Date("2022-10-01")) }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
const prop = defineProps<{ mode: "horizontal" | "vertical" }>();
const { t } = useI18n();
</script>

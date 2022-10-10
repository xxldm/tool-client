<template>
  <div
    flex="~ gap-4"
    :class="mode === 'horizontal' ? 'items-center' : 'justify-center flex-col'"
    :style="mode === 'horizontal' ? { width: 'max-content' } : {}"
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
          {{ asd }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ mode: "horizontal" | "vertical" }>();
const { t } = useI18n();

const asd = computed(() => formatDiff(now.value, new Date("2022-10-01 00:00:00")));
</script>

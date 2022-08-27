<template>
  <el-card>
    <template #header>
      <div
        flex
        justify-between
        items-center
      >
        <span>
          计时器
        </span>
        <el-button link>
          添加
        </el-button>
      </div>
    </template>
    <div flex="~ gap-4 wrap">
      <el-tag
        v-for="hourMeter in hourMeterStore.hourMeters"
        :key="hourMeter.duration"
        :type="hourMeter.checked ? 'success' : 'info'"
        closable
        :checked="hourMeter.checked"
        size="large"
        @click="click(hourMeter)"
      >
        {{ hourMeterStore.getRemainingTime(hourMeter) }}
      </el-tag>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import type { HourMeter } from "~/store/hour-meter";
const hourMeterStore = useHourMeterStore();
const time = unref(now);
const click = (hourMeter: HourMeter) => {
  hourMeter.checked = !hourMeter.checked;
  if (hourMeter.checked) {
    hourMeterStore.start(hourMeter);
  } else {
    hourMeter.endTime = undefined;
  }
};
</script>

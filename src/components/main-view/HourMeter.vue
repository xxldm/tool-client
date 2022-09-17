<template>
  <div
    flex="~ gap-4 wrap"
    items-center
    content-center
  >
    <div
      flex
      items-center
      m-r--3
    >
      <div
        i-carbon-timer
      />{{ t("mainLayout.component.label.HourMeter") }}
      <div i-carbon-barrier />
    </div>
    <el-tag
      v-for="(hourMeter, index) in hourMeterStore.hourMeters"
      :key="index"
      :type="hourMeter.checked ? 'success' : 'info'"
      effect="plain"
      cursor-pointer
      closable
      :class="hourMeter.ring ? 'flicker' : ''"
      :checked="hourMeter.checked"
      size="large"
      @click="click(hourMeter)"
      @close="hourMeterStore.del(index)"
    >
      <div
        flex="~ gap-1"
        m-r--2
      >
        <div>
          {{ hourMeterStore.getRemainingTime(hourMeter).value }}
        </div>
        <div i-carbon-barrier />
      </div>
    </el-tag>

    <el-input
      v-if="inputVisible"
      ref="InputRef"
      v-model="addHourMeterDuration"
      type="number"
      class="w-30"
      @keyup.enter="add"
      @blur="add"
    >
      <template #append>
        {{ t("date.unit.second") }}
      </template>
    </el-input>
    <el-button
      v-else
      @click="showInput"
    >
      <div
        i-carbon-close
        style="transform:rotate(45deg)"
      />
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import song from "/闹钟.mp3";
import type { HourMeter } from "~/store/hour-meter";

const { stop, sound } = $(useSound(song));
const { t } = useI18n();

const hourMeterStore = useHourMeterStore();

let addHourMeterDuration = $ref<number | undefined>(undefined);
let inputVisible = $ref(false);
const InputRef = $ref<HTMLElement>();

const click = (hourMeter: HourMeter) => {
  hourMeterStore.click(hourMeter);
  nextTick(() => {
    if (hourMeter.watch) {
      hourMeter.watch();
    }
    if (hourMeter.checked) {
      hourMeter.watch = watch(
        () => hourMeter.ring,
        (newValue) => {
          if (newValue) {
            hourMeter.ringId = sound.play();
          } else {
            stop(hourMeter.ringId);
            hourMeter.ringId = undefined;
          }
        });
    }
  });
};

const add = () => {
  addHourMeterDuration = Number(addHourMeterDuration);
  if (addHourMeterDuration && addHourMeterDuration !== 0) {
    hourMeterStore.add(addHourMeterDuration);
  }
  addHourMeterDuration = undefined;
  inputVisible = false;
};

const showInput = () => {
  inputVisible = true;
  nextTick(() => {
    InputRef?.focus();
  });
};
</script>

<style lang="scss">
.flicker {
  animation: aBlink 500ms infinite;
}

@keyframes aBlink {
  from { opacity: 0.5; }
  50% { opacity: 1; }
  to { opacity: 0.5; }
}
</style>

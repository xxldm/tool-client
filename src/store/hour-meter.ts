import dayjs from "dayjs";
import type { WatchStopHandle } from "vue";

export interface HourMeter {
  duration: number
  endTime?: Date
  checked?: boolean
  ring?: boolean
  ringId?: number
  watch?: WatchStopHandle
}

export const useHourMeterStore = defineStore("hour-meter", () => {
  const hourMeters = useStorage<HourMeter[]>("hour-meters", [{
    duration: 240,
  }, {
    duration: 600,
  }], myStorage, {
    serializer: {
      read: (v: string) => v ? JSON.parse(v) : null,
      write: (v: HourMeter[]) => JSON.stringify(v.map((hourMeter: HourMeter) => ({ duration: hourMeter.duration }))),
    },
  });

  const getRemainingTime = (hourMeter: HourMeter) => {
    return computed(() => {
      if (hourMeter.endTime === undefined) {
        hourMeter.ring = false;
        return formatDiff(hourMeter.duration);
      }
      if (now.value.getTime() > hourMeter.endTime?.getTime()) {
        hourMeter.ring = true;
      }
      return formatDiff(now.value, hourMeter.endTime);
    });
  };

  const start = (hourMeter: HourMeter) => {
    hourMeter.endTime = dayjs(now.value).add(hourMeter.duration, "second").toDate();
  };

  const click = (hourMeter: HourMeter) => {
    hourMeter.checked = !hourMeter.checked;
    if (hourMeter.checked) {
      start(hourMeter);
    } else {
      hourMeter.endTime = undefined;
    }
  };

  const del = (index: number) => {
    hourMeters.value.splice(index, 1);
  };

  const add = (duration: number) => {
    hourMeters.value.push({
      duration,
    });
  };

  return {
    hourMeters,
    getRemainingTime,
    start,
    click,
    del,
    add,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHourMeterStore, import.meta.hot));
}

import dayjs from "dayjs";

export interface HourMeter {
  duration: number
  endTime: Date | undefined
  checked: boolean
}

export const useHourMeterStore = defineStore("hour-meter", () => {
  const hourMeters = ref([{
    duration: 240,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }, {
    duration: 600,
    endTime: undefined,
    checked: false,
  }]);

  const getRemainingTime = (hourMeters: HourMeter) =>
    computed(() => hourMeters.endTime ? formatDiff(now.value, hourMeters.endTime) : formatDiff(hourMeters.duration));

  const start = (hourMeters: HourMeter) => {
    hourMeters.endTime = dayjs(now.value).add(hourMeters.duration, "second").toDate();
  };

  return {
    hourMeters,
    getRemainingTime,
    start,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHourMeterStore, import.meta.hot));
}

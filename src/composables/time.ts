import dayjs from "dayjs";

import { t } from "~/modules/i18n";

export const now = useNow();
export function formatDiff(diffSecond: number, maxUnitCount?: number): string;
export function formatDiff(startTime: Date, endTime: Date, maxUnitCount?: number): string;
export function formatDiff(arg1: Date | number, arg2: Date | number | undefined, maxUnitCount = 2): string {
  if (typeof arg1 === "number") {
    const startTime = dayjs();
    const endTime = startTime.add(arg1, "second");
    return formatDiff(startTime.toDate(), endTime.toDate(), arg2 as number | undefined);
  }
  const units: ["year", "month", "day", "hour", "minute", "second"] = ["year", "month", "day", "hour", "minute", "second"];
  for (const unit of units) {
    const diff = dayjs(arg2).diff(arg1, unit);
    if (diff > 0) {
      let towUnitDiff = "";
      if (unit !== "second" && maxUnitCount > 1) {
        const newStartTime = dayjs(arg1).add(diff, unit);
        towUnitDiff = formatDiff(newStartTime.toDate(), arg2 as Date, maxUnitCount - 1);
      }

      return `${diff} ${t(`date.unit.${unit}`)}${towUnitDiff ? `, ${towUnitDiff}` : towUnitDiff}`;
    }
  }
  return `0 ${t("date.unit.second")}`;
}

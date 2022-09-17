import dayjs, { type ManipulateType, type OpUnitType } from "dayjs";

import { t } from "~/modules/i18n";

/**
 * 把秒转换成距离现在的时间差, 然后格式化
 * (1) -> 1秒
 * (61,2) -> 1分 1秒
 * @param diffSecond 秒数
 * @param maxUnitCount 单位个数
 */
export function formatDiff(diffSecond: number, maxUnitCount?: number): string;
/**
 * 格式化两个时间的秒数差
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param maxUnitCount 单位个数
 */
export function formatDiff(startTime: Date, endTime: Date, maxUnitCount?: number, isRoot?: boolean): string;
/**
 * 如果参数1是秒数 把秒转换成起止时间, 然后调用本身
 * 如果参数1是时间 格式化两个时间的秒数差
 * ps:不同的月份有不同的天数, 所有需要有一个时间作为基础, 不能直接格式化秒数
 * ps2:虽然无视[ps]的内容,都按30天算,也没啥大问题就是了.
 * @param arg1 开始时间 或者 秒数
 * @param arg2 结束时间 或者 单位个数
 * @param maxUnitCount 单位个数
 * @param isRoot 单位个数
 */
export function formatDiff(arg1: Date | number, arg2: Date | number | undefined, maxUnitCount = 2, isRoot = true): string {
  if (typeof arg1 === "number") {
    if (arg1 === 0) {
      return `0 ${t("date.unit.second")}`;
    }
    const startTime = dayjs();
    const endTime = startTime.add(arg1, "second");
    return formatDiff(startTime.toDate(), endTime.toDate(), arg2 as number | undefined, true);
  }
  const units: OpUnitType[] = ["year", "month", "week", "day", "hour", "minute", "second"];
  for (const unit of units) {
    const diff = dayjs(arg2).diff(arg1, unit);
    if (diff > 0) {
      let towUnitDiff = "";
      if (unit !== "second" && maxUnitCount > 1) {
        const newStartTime = dayjs(arg1).add(diff, unit as ManipulateType);
        towUnitDiff = formatDiff(newStartTime.toDate(), arg2 as Date, maxUnitCount - 1, false);
      }

      return `${diff} ${t(`date.unit.${unit}`)}${towUnitDiff ? `, ${towUnitDiff}` : towUnitDiff}`;
    }
  }
  return isRoot ? `0 ${t("date.unit.second")}` : "";
}

/**
 * 格式化字节大小     *
 * @return string 格式化后的带单位的大小
 * @param $size
 * @param $delimiter
 */

export const formatBytes = ($size: number, $delimiter = " "): string => {
  if ($size === undefined) {
    return `${0 + $delimiter}B`;
  }
  const $units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let $i = 0;
  for (; $size >= 1024 && $i < 5; $i++) {
    $size /= 1024;
  }
  return Math.round($size) + $delimiter + $units[$i];
};

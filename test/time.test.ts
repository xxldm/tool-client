import { setLocale } from "~/modules/i18n";

export default {};

it("time", async () => {
  await setLocale("zh-cn");
  expect(formatDiff(0)).toMatchInlineSnapshot("\"0 秒\"");
  expect(formatDiff(1)).toMatchInlineSnapshot("\"1 秒\"");
  expect(formatDiff(60)).toMatchInlineSnapshot("\"1 分\"");
  expect(formatDiff(61)).toMatchInlineSnapshot("\"1 分, 1 秒\"");
  expect(formatDiff(60 * 60)).toMatchInlineSnapshot("\"1 小时\"");
  expect(formatDiff(60 * 60 + 1)).toMatchInlineSnapshot("\"1 小时, 1 秒\"");
  expect(formatDiff(24 * 60 * 60)).toMatchInlineSnapshot("\"1 天\"");
  expect(formatDiff(24 * 60 * 60 + 1)).toMatchInlineSnapshot("\"1 天, 1 秒\"");
  expect(formatDiff(60 * 24 * 60 * 60)).toMatchInlineSnapshot("\"1 月, 29 天\"");
  expect(formatDiff(460 * 24 * 60 * 60)).toMatchInlineSnapshot("\"1 年, 3 月\"");
  expect(formatDiff(460 * 24 * 60 * 60 + 61, 3)).toMatchInlineSnapshot("\"1 年, 3 月, 3 天\"");
  expect(formatDiff(460 * 24 * 60 * 60 + 61, 4)).toMatchInlineSnapshot("\"1 年, 3 月, 3 天, 1 分\"");
  expect(formatDiff(460 * 24 * 60 * 60 + 61, 5)).toMatchInlineSnapshot("\"1 年, 3 月, 3 天, 1 分, 1 秒\"");
  expect(formatDiff(
    new Date("2022-08-29 20:30:00"),
    new Date("2022-08-29 20:30:00")))
    .toMatchInlineSnapshot("\"0 秒\"");
  expect(formatDiff(
    new Date("2022-08-29 20:30:00"),
    new Date("2022-08-29 21:30:00")))
    .toMatchInlineSnapshot("\"1 小时\"");
  expect(formatDiff(
    new Date("2021-08-29 20:30:00"),
    new Date("2022-08-29 21:30:00")))
    .toMatchInlineSnapshot("\"1 年, 1 小时\"");
  expect(formatDiff(
    new Date("2021-08-29 20:30:00"),
    new Date("2022-08-29 21:40:00")))
    .toMatchInlineSnapshot("\"1 年, 1 小时\"");
  expect(formatDiff(
    new Date("2021-08-29 20:30:00"),
    new Date("2022-08-29 21:40:00"), 3))
    .toMatchInlineSnapshot("\"1 年, 1 小时, 10 分\"");
});

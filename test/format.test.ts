import { setLocale } from "~/modules/i18n";

export default {};

it("formatDiff", async () => {
  await setLocale("zh-cn");
  expect(formatDiff(0)).toMatchInlineSnapshot("\"0 秒\"");
  expect(formatDiff(60)).toMatchInlineSnapshot("\"1 分\"");
  expect(formatDiff(60 * 60)).toMatchInlineSnapshot("\"1 小时\"");
  expect(formatDiff(24 * 60 * 60)).toMatchInlineSnapshot("\"1 天\"");
  expect(formatDiff(25 * 60 * 61 + 1, 2)).toMatchInlineSnapshot("\"1 天, 1 小时\"");
  expect(formatDiff(25 * 60 * 61 + 1, 3)).toMatchInlineSnapshot("\"1 天, 1 小时, 25 分\"");
  expect(formatDiff(25 * 60 * 61 + 1, 4)).toMatchInlineSnapshot("\"1 天, 1 小时, 25 分, 1 秒\"");
  expect(formatDiff(25 * 60 * 61 + 1, 5)).toMatchInlineSnapshot("\"1 天, 1 小时, 25 分, 1 秒\"");
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

it("formatBytes", () => {
  expect(formatBytes(0)).toMatchInlineSnapshot("\"0 B\"");
  expect(formatBytes(10)).toMatchInlineSnapshot("\"10 B\"");
  expect(formatBytes(2048)).toMatchInlineSnapshot("\"2 KB\"");
  expect(formatBytes(2048 * 1024)).toMatchInlineSnapshot("\"2 MB\"");
  expect(formatBytes(2048 * 1024 * 1024)).toMatchInlineSnapshot("\"2 GB\"");
  expect(formatBytes(2048 * 1024 * 1024 * 1024)).toMatchInlineSnapshot("\"2 TB\"");
  expect(formatBytes(2048 * 1024 * 1024 * 1024 * 1024)).toMatchInlineSnapshot("\"2 PB\"");
  expect(formatBytes(2048 * 1024 * 1024 * 1024 * 1024 * 1024)).toMatchInlineSnapshot("\"2048 PB\"");
});

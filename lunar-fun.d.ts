declare module "lunar-fun" {
  function gregorianToLunal(year: number, month: number, day: number): number[]
  function lunalToGregorian(year: number, month: number, day: number, isRun: boolean): number[]
}

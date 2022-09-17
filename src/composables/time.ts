import lunarFun from "lunar-fun";

export const now = useNow();

// 公里 1.1 元旦 4.5 清明 5.1 劳动 10.1 国庆
// 农历 1.1 春节 5.5 端午 8.15 中秋

console.log("[time]", "[lunarFun.lunalToGregorian(2022, 1, 1, false)]", lunarFun.lunalToGregorian(2022, 1, 1, false));
console.log("[time]", "[lunarFun.lunalToGregorian(2022, 1, 1, false)]", lunarFun.lunalToGregorian(2022, 5, 5, false));
console.log("[time]", "[lunarFun.lunalToGregorian(2022, 1, 1, false)]", lunarFun.lunalToGregorian(2022, 8, 15, false));

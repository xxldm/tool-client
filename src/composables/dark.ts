export const isDark = useDark({
  storageKey: "themeSource",
  valueDark: "dark",
  valueLight: "light",
  storage: myStorage,
});
export const toggleDark = useToggle(isDark);

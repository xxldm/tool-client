<template>
  <div
    b-t-1
    style="border-color: var(--el-border-color);"
  >
    <div
      text-xl
      mt-6
      inline-flex
      gap-3
    >
      <el-link
        i-carbon-logo-github
        text-2xl
        rel="noopener noreferrer"
        href="https://github.com/xxldm/tool-client"
        target="_blank"
        title="GitHub"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { setLocale, supportLocales } from "~/modules/i18n";
const localeStore = useLocaleStore();
const disabled = (locale: string) => localeStore.locale === locale;
const click = (locale: string) => localeStore.locale = locale;
</script>

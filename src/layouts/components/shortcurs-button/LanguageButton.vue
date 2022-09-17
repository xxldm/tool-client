<template>
  <el-dropdown @command="click">
    <el-button
      circle
      size="large"
    >
      <span
        i-carbon-translate
        text-2xl
      />
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="(locale, key) in supportLocales"
          :key="key"
          :command="key"
          :disabled="disabled(key as string)"
        >
          {{ locale.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { supportLocales } from "~/modules/i18n";
const localeStore = useLocaleStore();
const disabled = (locale: string) => localeStore.locale === locale;
const click = (locale: string) => localeStore.locale = locale;
</script>

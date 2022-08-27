<template>
  <div text-xl mt-6 inline-flex gap-3>
    <el-popover
      placement="top"
    >
      <template #reference>
        <i i-carbon-translate text-2xl />
      </template>
      <template #default>
        <div flex="~ col">
          <el-button v-for="locale in supportLocales" :key="locale.locale" text m="l-0!" :disabled="disabled(locale.locale)" @click="setLocale(locale.locale)">
            <div v-show="disabled(locale.locale)" i-carbon-checkmark m-r-1 />
            {{ locale.name }}
          </el-button>
        </div>
      </template>
    </el-popover>

    <el-link dark:i-carbon-moon i-carbon-sun text-2xl rel="noopener noreferrer" @click="toggleDark()" />

    <el-link
      i-carbon-logo-github text-2xl rel="noopener noreferrer"
      href="https://github.com/xxldm/tool-client"
      target="_blank"
      title="GitHub"
    />
  </div>
</template>

<script lang="ts" setup>
import { setLocale, supportLocales } from "~/modules/i18n";
const disabled = (locale: string) => useLocaleStore().locale === locale;
</script>

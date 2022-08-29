<template>
  <div
    text-xl
    mt-6
    inline-flex
    gap-3
  >
    <el-popover placement="top">
      <template #reference>
        <i
          i-carbon-translate
          text-2xl
        />
      </template>
      <template #default>
        <div flex="~ col">
          <el-button
            v-for="(locale, key) in supportLocales"
            :key="key"
            text
            m="l-0!"
            :disabled="disabled(key as string)"
            @click="click(key as string)"
          >
            <div
              v-show="disabled(key as string)"
              i-carbon-checkmark
              m-r-1
            />
            {{ locale.name }}
          </el-button>
        </div>
      </template>
    </el-popover>

    <el-link
      i-carbon-sun
      dark:i-carbon-moon
      text-2xl
      rel="noopener noreferrer"
      @click="toggleDark()"
    />

    <el-link
      i-carbon-logo-github
      text-2xl
      rel="noopener noreferrer"
      href="https://github.com/xxldm/tool-client"
      target="_blank"
      title="GitHub"
    />
  </div>
</template>

<script lang="ts" setup>
import { setLocale, supportLocales } from "~/modules/i18n";
const localeStore = useLocaleStore();
const disabled = (locale: string) => localeStore.locale === locale;
const click = (locale: string) => localeStore.locale = locale;
</script>

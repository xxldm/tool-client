<template>
  <el-divider
    v-if="isElectron"
    content-position="left"
  >
    {{ t("settings.system") }}
  </el-divider>

  <el-descriptions v-if="isElectron">
    <el-descriptions-item
      v-if="!getPlatform().isLinux && isPackage"
      :label="t('settings.label.openAtLogin')"
    >
      <el-switch v-model="settingsStore.openAtLogin" />
    </el-descriptions-item>
    <el-descriptions-item
      v-if="isPackage"
      :label="t('settings.label.allowPrerelease')"
    >
      <el-switch v-model="settingsStore.allowPrerelease" />
    </el-descriptions-item>
  </el-descriptions>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const settingsStore = useSettingsStore();
</script>

<route lang="yaml">
name: system.settings
meta:
  hidden: true
</route>

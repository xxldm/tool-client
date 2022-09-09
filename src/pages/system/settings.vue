<template>
  <el-divider
    v-if="isElectron"
    content-position="left"
  >
    {{ t("settings.system") }}
  </el-divider>
  <div
    v-if="isElectron"
    flex="~ gap-40 wrap"
    m-10
    items-center
  >
    <div
      v-if="!getPlatform().isLinux && isPackage"
      flex="~ gap-4"
      items-center
    >
      <label>{{ t('settings.label.openAtLogin') }}:</label>
      <el-switch v-model="settingsStore.openAtLogin" />
    </div>
    <div
      v-if="isPackage"
      flex="~ gap-4"
      items-center
    >
      <label>{{ t('settings.label.allowPrerelease') }}:</label>
      <el-switch v-model="settingsStore.allowPrerelease" />
    </div>
    <div
      v-if="getPlatform().isWin && isPackage"
      flex="~ gap-4"
      items-center
    >
      <label>{{ t('settings.label.windowMode') }}:</label>
      <el-switch
        v-model="settingsStore.isNormal"
        :active-text="t('settings.label.wallpaperMode')"
        :inactive-text="t('window')"
        :active-value="false"
        :inactive-value="true"
      />
      <div
        v-if="!settingsStore.isNormal"
        flex="~ gap-4"
        items-center
      >
        <el-radio-group v-model="settingsStore.displayIndex">
          <el-radio
            m="r-2!"
            :label="-1"
            border
          >
            {{ t('main') + t('settings.label.display') }}
          </el-radio>
          <el-radio
            v-for="i of getDisplayCount()"
            :key="i"
            m="r-2!"
            :label="i - 1"
            border
          >
            {{ t('settings.label.display') }} {{ i }}
          </el-radio>
        </el-radio-group>
      </div>
    </div>
  </div>
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

<template>
  <el-result
    v-show="!updateStore.newVersion"
    v-loading="updateStore.loading"
    icon="success"
    :title="`${t('update.latestVersion')}！`"
    :sub-title="`${t('update.currentVersion')}：${updateStore.currentVersion}`"
  >
    <template #extra>
      <el-button
        type="primary"
        @click="updateStore.showDialog = false"
      >
        {{
          t("confirm")
        }}
      </el-button>
    </template>
  </el-result>
  <el-result
    v-if="updateStore.newVersion"
    v-loading="updateStore.loading"
    icon="warning"
    :title="`${$t('update.newVersion')}：${updateInfo.version}`"
    :sub-title="`${$t('update.currentVersion')}：${updateStore.currentVersion}`"
  >
    <template #extra>
      <el-descriptions
        :column="1"
        direction="vertical"
      >
        <el-descriptions-item
          v-show="!updateStore.downloaded && !updateStore.downloading"
          :label="`${$t('yes') + $t('no') + $t('update.update')}？${
            updateInfo.files[0].size
              ? `(${formatBytes(updateInfo.files[0].size)})`
              : ''
          }`"
        >
          <el-button
            type="primary"
            @click="downloadUpdateClick"
          >
            {{ $t("download") + $t("update.update") }}
          </el-button>
          <el-button
            v-show="!isSkip"
            type="primary"
            @click="skipUpdate"
          >
            {{ t("update.skipUpdate") }}
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="!updateStore.downloaded && updateStore.downloading"
          :label="`${t('update.downloading')}！`"
        >
          {{ formatBytes(progressInfo.transferred) }}/{{
            formatBytes(progressInfo.total)
          }}({{ formatBytes(progressInfo.bytesPerSecond) }}/s)
          <el-progress
            :text-inside="progressInfo.percent !== undefined"
            :show-text="progressInfo.percent !== undefined"
            :stroke-width="26"
            :percentage="
              progressInfo.percent
                ? Math.round(progressInfo.percent)
                : 100
            "
            :indeterminate="!progressInfo.percent"
          />
        </el-descriptions-item>
        <el-descriptions-item
          v-show="updateStore.downloaded"
          :label="`${t('reboot')}${t('app')}？`"
        >
          <el-button
            type="primary"
            @click="quitAndInstall()"
          >
            {{
              t("reboot")
            }}
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item
          :label="`${t('update.update')}${t('content')}？`"
          :min-width="500"
        >
          <div
            class="markdown-body"
            v-html="updateInfo.releaseNotes"
          />
        </el-descriptions-item>
      </el-descriptions>
    </template>
  </el-result>
</template>

<script lang="ts" setup>
import type { ProgressInfo, UpdateInfo } from "electron-updater";

const updateStore = useUpdateStore();
const { t } = useI18n();

let updateInfo = $ref<UpdateInfo>();
let progressInfo = $ref<ProgressInfo>();

const skipUpdate = () => {
  updateStore.skipVersion = updateInfo.version;
};

const isSkip = computed(() => updateStore.skipVersion === updateInfo.version);

updateAvailable((_event, data) => {
  updateInfo = data;
  updateStore.newVersion = true;
  updateStore.loading = false;
  updateStore.showDialog = true;
});
updateNotAvailable(() => {
  updateStore.loading = false;
  updateStore.newVersion = false;
});

const downloadUpdateClick = () => {
  downloadUpdate();
  updateStore.downloading = true;
};

downloadProgress((_event, data) => {
  progressInfo = data;
});

downloadDownloaded(() => {
  updateStore.downloading = false;
  updateStore.downloaded = true;
});

onMounted(() => {
  if (isElectron) {
    checkUpdate();
    updateStore.loading = true;
  }
});
</script>

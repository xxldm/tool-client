<template>
  <el-dialog
    v-model="useUpdateStore().showDialog"
    width="35rem"
    :title="t('update.title')"
    center
    @open="open"
    @closed="closed"
  >
    <el-result
      v-if="updateStore.errorMessage"
      icon="error"
      :title="`${t('update.error')}：${updateStore.errorMessage}`"
      :sub-title="`${t('update.currentVersion')}：${updateStore.currentVersion}`"
      p="0!"
    >
      <template #extra>
        <el-button
          plain
          type="primary"
          @click="updateStore.showDialog = false"
        >
          {{ t("confirm.confirm") }}
        </el-button>
        <el-button
          type="primary"
          @click="errorRetry"
        >
          {{ t("retry") }}
        </el-button>
      </template>
    </el-result>
    <el-result
      v-else-if="updateStore.newVersion"
      v-loading="updateStore.loading"
      :element-loading-text="t('update.checkUpdate')"
      icon="warning"
      :title="`${t('update.newVersion')}：${updateInfo.version}`"
      :sub-title="`${t('update.currentVersion')}：${updateStore.currentVersion}`"
      p="0!"
    >
      <template #extra>
        <el-descriptions
          :column="1"
          direction="vertical"
        >
          <el-descriptions-item
            v-if="!updateStore.downloaded && !updateStore.downloading"
            :label="`${t('yes') + t('no') + t('update.update')}？${
              updateInfo.files[0].size
                ? `(${formatBytes(updateInfo.files[0].size)})`
                : ''
            }`"
          >
            <el-button
              type="primary"
              @click="downloadUpdateClick"
            >
              {{ t("download") + t("update.update") }}
            </el-button>
            <el-button
              :disabled="isSkip"
              type="primary"
              @click="skipUpdate"
            >
              {{ isSkip ? t("update.isSkipUpdate") : t("update.skipUpdate") }}
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item
            v-else-if="updateStore.downloading"
            :label="`${t('update.downloading')}！`"
          >
            {{ formatBytes(progressInfo?.transferred) }}/{{ formatBytes(progressInfo?.total) }}
            ({{ formatBytes(progressInfo?.bytesPerSecond) }}/s)
            <el-progress
              :text-inside="progressInfo?.percent !== undefined"
              :show-text="progressInfo?.percent !== undefined"
              :stroke-width="20"
              :percentage="
                progressInfo?.percent
                  ? Math.round(progressInfo?.percent)
                  : 100
              "
              :indeterminate="!progressInfo?.percent"
            />
            <el-button
              m-t-2
              type="primary"
              @click="cancelDownloadUpdateClick()"
            >
              {{ t("cancel") }}
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item
            v-else
            :label="`${t('reboot')}${t('app')}？`"
          >
            <el-button
              type="primary"
              @click="quitAndInstall()"
            >
              {{ t("reboot") }}
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item
            :label="`${t('update.update')}${t('content')}:`"
            :min-width="500"
            class-name="p-0!"
          >
            <el-scrollbar
              height="25rem"
              view-class="flex flex-gap-2 flex-col"
            >
              <el-card
                v-for="releaseNote in updateInfo.releaseNotes as Array<{
                  readonly version: string;
                  readonly note: string | null;
                }>"
                :key="releaseNote.version"
                shadow="never"
              >
                <el-divider
                  class="el-divider"
                  content-position="left"
                >
                  <h1>v{{ releaseNote.version }}</h1>
                </el-divider>
                <div
                  class="markdown-body"
                  v-html="releaseNote.note"
                />
              </el-card>
            </el-scrollbar>
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-result>
    <el-result
      v-else
      v-loading="updateStore.loading"
      icon="success"
      :title="`${t('update.latestVersion')}！`"
      :sub-title="`${t('update.currentVersion')}：${updateStore.currentVersion}`"
      p="0!"
    >
      <template #extra>
        <el-button
          plain
          @click="updateStore.showDialog = false"
        >
          {{
            t("confirm.confirm")
          }}
        </el-button>
      </template>
    </el-result>
  </el-dialog>
</template>

<script lang="ts" setup>
import type { ProgressInfo, UpdateInfo } from "electron-updater";

const updateStore = useUpdateStore();
const { t } = useI18n();

let updateInfo = $ref<UpdateInfo>();
let progressInfo = $ref<ProgressInfo>();

// 跳过当前更新
const skipUpdate = () => {
  // 保存跳过的版本
  updateStore.skipVersion = updateInfo.version;
};

// 判断是否是跳过的版本
const isSkip = $computed(() => updateStore.skipVersion === updateInfo.version);

// 获取更新
const getUpdate = () => {
  updateStore.loading = true;
  checkUpdate();
};

// 获取到更新
updateAvailable((_event, data) => {
  // 更新更新信息
  updateInfo = data;
  // 设置更新状态为true
  updateStore.newVersion = true;
  // 设置获取状态为false
  updateStore.loading = false;
  if (!isSkip) {
    // 不是跳过版本, 打开更新窗口
    updateStore.showDialog = true;
  }
});

// 获取结果没有更新
updateNotAvailable(() => {
  // 设置获取状态为false
  updateStore.loading = false;
});

// 点击下载更新
const downloadUpdateClick = () => {
  // 开始下载更新
  downloadUpdate();
  // 设置下载中状态为true
  updateStore.downloading = true;
};

// 点击取消下载更新
const cancelDownloadUpdateClick = () => {
  // 取消下载更新
  cancelDownloadUpdate();
};

// 取消了下载
updateCancelled((_event, data) => {
  // 清除更新信息
  updateInfo = {} as UpdateInfo;
  updateStore.newVersion = false;
  // 清除下载信息
  progressInfo = {} as ProgressInfo;
  updateStore.downloading = false;
  // 重新获取更新
  getUpdate();
});

// 下载进度
downloadProgress((_event, data) => {
  // 更新下载进度
  progressInfo = data;
});

// 下载完成
downloadDownloaded(() => {
  // 更新下载中状态为false
  updateStore.downloading = false;
  // 更新下载完成状态为true
  updateStore.downloaded = true;
  // 如果下载中关闭了窗口, 下载完成, 重新打开更新窗口
  updateStore.showDialog = true;
});

// 更新出错
updateError((_event, error) => {
  updateStore.loading = false;
  updateStore.errorMessage = error.message;
});

// 更新出错 重试按钮
const errorRetry = () => {
  // 有可能新版本不存在了导致的更新出错, 清除更新信息
  updateInfo = {} as UpdateInfo;
  updateStore.newVersion = false;
  // 有可能下载失败导致的错误, 清除下载信息
  progressInfo = {} as ProgressInfo;
  updateStore.downloading = false;
  // 清除错误信息
  updateStore.errorMessage = undefined;
  // 重新获取更新
  getUpdate();
};

// 窗口加载了, 自动获取更新
onMounted(getUpdate);

/**
 * 打开更新窗口事件
 */
const open = () => {
  // 如果有错误, 直接调用出错重试方法
  if (updateStore.errorMessage) {
    return errorRetry();
  }
  // 正在获取更新 - 不需要处理
  if (updateStore.loading) {
    return;
  }
  // 有更新信息 - 不需要处理
  if (updateStore.newVersion) {
    return;
  }
  // 没有更新信息, 也没有在获取更新信息, 获取更新
  getUpdate();
};

const closed = () => {
  // 如果正在获取更新 - 不需要处理
  if (updateStore.loading) {
    return;
  }
  // 下载中或者下载完成 - 不需要处理
  if (updateStore.downloading || updateStore.downloaded) {
    return;
  }
  // 没有在获取更新, 也没有下载. 清除状态数据, 下次打开重新获取版本
  updateInfo = {} as UpdateInfo;
  updateStore.newVersion = false;
};
</script>

<style scoped lang="scss">
.el-divider {
  :deep(.el-divider__text) {
    background-color: var(--el-card-bg-color);
  }
}
</style>

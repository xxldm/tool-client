<template>
  <el-dialog
    v-model="useUpdateStore().showDialog"
    width="550px"
    :title="t('update.title')"
    center
    @open="open"
    @close="close"
  >
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
const isSkip = computed(() => updateStore.skipVersion === updateInfo.version);

// 获取到更新
updateAvailable((_event, data) => {
  // 更新新版本信息
  updateInfo = data;
  // 设置新版本状态为true
  updateStore.newVersion = true;
  // 设置获取状态为false
  updateStore.loading = false;
  // 打开更新窗口
  updateStore.showDialog = true;
});
// 获取结果没有更新
updateNotAvailable(() => {
  // 设置获取状态为false
  updateStore.loading = false;
});
// 下载更新点击
const downloadUpdateClick = () => {
  // 开始下载更新
  downloadUpdate();
  // 设置下载中状态为true
  updateStore.downloading = true;
};
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

// 窗口加载了, 自动获取更新
onMounted(() => {
  // 获取更新
  checkUpdate();
  // 获取状态设置
  updateStore.loading = true;
});

/**
 * 打开更新窗口事件
 * 3种触发方式
 * 1.获取到新版本
 * 2.下载完成
 * 3.手动点击获取更新按钮
 */
const open = () => {
  /**
   * updateStore.newVersion 为 true 几种可能
   * 获取到新版本 - 不需要处理
   * 下载中/下载完成 关闭窗口, 下载完成自动/手动 打开窗口 - 不需要处理
   */
  if (updateStore.newVersion) {
    return;
  }
  // 已经在获取新版本 - 不需要处理
  if (updateStore.loading) {
    return;
  }
  /**
   * 既没有新版本, 也没有获取新版本 几种可能
   * 获取过, 没有获取到新版本 - 重新获取
   * 获取到了新版本, 没有点击下载, 然后关闭了窗口 - 重新获取
   */
  checkUpdate();
};

const close = () => {
  // 如果正在获取新版本 - 不需要处理
  if (updateStore.loading) {
    return;
  }
  // 没有新版本 - 不需要处理
  if (!updateStore.newVersion) {
    return;
  }
  // 有新版本, 但没有下载, 也不是下载完成了
  if (!updateStore.downloading && !updateStore.downloaded) {
    // 清除状态数据, 下次打开重新获取版本
    updateInfo = {} as UpdateInfo;
    progressInfo = {} as ProgressInfo;
    updateStore.newVersion = false;
  }
};
</script>

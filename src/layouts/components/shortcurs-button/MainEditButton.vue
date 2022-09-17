<template>
  <div
    flex="~ gap-2"
    items-center
  >
    <template v-if="mainLayoutStore.isEdit">
      <div>
        间距:
      </div>
      <el-input-number
        v-model="mainLayoutStore.gap"
        step-strictly
        w-18
        :min="1"
        :max="9"
        size="small"
      />
      <div>
        行数:
      </div>
      <el-input-number
        v-model="mainLayoutStore.row"
        step-strictly
        w-18
        :min="1"
        :max="9"
        size="small"
      />
      <div>
        列数:
      </div>
      <el-input-number
        v-model="mainLayoutStore.col"
        step-strictly
        w-18
        :min="1"
        :max="9"
        size="small"
      />
      <el-button
        circle
        size="large"
        type="success"
        plain
        @click="saveFn"
      >
        <span
          i-carbon-checkmark
          text-2xl
        />
      </el-button>
      <el-popconfirm
        :title="t('confitm.save')"
        width="auto"
        @confirm="saveFn"
        @cancel="cancelFn"
      >
        <template #reference>
          <el-button
            circle
            size="large"
            type="warning"
            plain
          >
            <span
              i-carbon-close
              text-2xl
            />
          </el-button>
        </template>
      </el-popconfirm>
    </template>
    <template v-else>
      <el-button
        circle
        size="large"
        :title="t('shortcuts.button.title.main-edit')"
        @click="editFn"
      >
        <span
          i-carbon-workspace
          text-2xl
        />
      </el-button>
    </template>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const router = useRouter();
const mainLayoutStore = useMainLayoutStore();

router.beforeEach(() => {
  // 不是编辑状态 || 用户选择是否跳转
  return !mainLayoutStore.isEdit || ElMessageBox.confirm(
    t("confirm.noSaveGoPage"),
    {
      confirmButtonText: t("yes"),
      cancelButtonText: t("no"),
      type: "warning",
    },
  )
    .then(() => {
      mainLayoutStore.$reset();
      return true;
    })
    .catch(() => {
      return false;
    });
});
const editFn = () => {
  mainLayoutStore.edit = true;
};
const saveFn = () => {
  mainLayoutStore.edit = false;
  mainLayoutStore.save();
};
const cancelFn = () => {
  mainLayoutStore.edit = false;
  mainLayoutStore.$reset();
};
</script>

<style scoped lang="scss">
.el-button + .el-button{
  margin-left: 0;
}
</style>

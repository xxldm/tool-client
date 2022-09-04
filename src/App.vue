<template>
  <el-config-provider :locale="localeStore.elLocale">
    <router-view />
    <el-dialog
      v-model="useUpdateStore().showDialog"
      width="550px"
      :title="t('update.title')"
      center
    >
      <app-update />
    </el-dialog>
  </el-config-provider>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const route = useRoute();
const localeStore = useLocaleStore();
useHead({
  title: computed(() => {
    if (!route.name) {
      return t("appName");
    }
    return `${t(route.name.toString())} - ${t("appName")}`;
  }),
  htmlAttrs: {
    // 后续修改lang属性,不会改变浏览器翻译功能的当前语言
    lang: computed(() => localeStore.locale),
  },
});
</script>

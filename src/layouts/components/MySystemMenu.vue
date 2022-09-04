<template>
  <el-dropdown class="flex-none m-auto">
    <el-avatar :src="avatar">
      <img
        h-full
        w-full
        src="/favicon.svg"
      >
    </el-avatar>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="router.push('/system/settings')">
          <span
            i-carbon-settings
            p-r-1
          />
          {{ t("system.settings") }}
        </el-dropdown-item>
        <el-dropdown-item
          v-if="isElectron && isPackage"
          @click="useUpdateStore().showDialog = true;checkUpdate()"
        >
          <span
            i-carbon-renew
            p-r-1
          />
          {{ t("get") }}{{ t("update.update") }}
        </el-dropdown-item>
        <el-dropdown-item
          v-if="isElectron"
          divided
          @click="closeApp"
        >
          <span
            i-carbon-power
            p-r-1
          />
          {{ t("system.closeApp") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const router = useRouter();
const avatar = $ref("https://xxldm.synology.me/clash-rule/仓鼠仓.svg");
</script>

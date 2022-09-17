<template>
  <el-container>
    <el-header>
      <my-header />
    </el-header>
    <el-scrollbar wrap-class="backtop-target">
      <el-main>
        <my-main />
      </el-main>
      <el-footer text-center>
        <my-footer />
      </el-footer>
    </el-scrollbar>
    <el-backtop target=".backtop-target">
      <span i-carbon-plane />
    </el-backtop>
  </el-container>
</template>

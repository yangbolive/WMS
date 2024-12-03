<template>
<div class="app-main">
  <router-view v-slot="{Component}">
       <keep-alive :include="cachedViews && cachedViews.map((item:any) => item.name)">
         <component :is="Component"  />
       </keep-alive>
 </router-view>
</div>
</template>

<script setup lang="ts">
import { useTagsViewStore } from "@/store";
import { storeToRefs } from "pinia";
const store= useTagsViewStore();
const { cachedViews } = storeToRefs(store);
//const cachedViews = computed(() => useTagsViewStore().cachedViews); // 缓存页面集合
</script>

<style lang="scss" scoped>
.app-main {
  position: relative;
  width: 100%;
  min-height: calc(100vh - $navbar-height);
  overflow: hidden;
  background-color: var(--el-bg-color-page);
}

.hasTagsView .app-main {
  min-height: calc(100vh - $navbar-height - $tags-view-height);
}

.fixed-header + .app-main {
  min-height: 100vh;
  padding-top: $navbar-height;
}

.hasTagsView .fixed-header + .app-main {
  min-height: 100vh;
  padding-top: $navbar-height + $tags-view-height;
}

.layout-mix,
.layout-top {
  .fixed-header + .app-main {
    padding-top: 0;
  }
}

.layout-mix {
  .app-main {
    height: calc(100vh - $navbar-height);
    padding-top: 0;
    overflow-y: auto;
  }

  .hasTagsView .app-main {
    height: calc(100vh - $navbar-height - $tags-view-height);
    min-height: calc(100vh - $navbar-height - $tags-view-height);
  }

  .fixed-header + .app-main {
    min-height: calc(100vh - $navbar-height);
  }

  .hasTagsView .fixed-header + .app-main {
    height: calc(100vh - $navbar-height);
    min-height: calc(100vh - $navbar-height);
    padding-top: $tags-view-height;
  }
}

.layout-top {
  .hasTagsView .fixed-header + .app-main {
    padding-top: $tags-view-height;
  }
}
</style>

<script setup lang="ts">
import SidebarMain from "~/composables/sidebarMain.vue";
</script>

<template>
  <div class="layout">
    <SidebarMain class="hide" />
    <div class="scroll">
      <slot class="apply" />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 0.5rem;
  overflow-x: hidden;
}

.scroll {
  overflow-y: auto;
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
}

@media print {
  .hide {
    display: none;
  }

  .scroll {
    overflow: hidden;
  }

}

.print-esque {
  .hide {
    display: none;
  }

  .scroll {
    overflow: hidden;
  }
}
</style>

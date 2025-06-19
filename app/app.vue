<template>
  <UApp>
    <div class="min-h-dvh not-print:grid">
      <NuxtPage />
    </div>
  </UApp>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Zirco` : 'Zirco';
  },
});
</script>

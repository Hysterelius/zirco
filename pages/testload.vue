<template>
    <div class="card">
      <Toast />
  
      <FileUpload
        name="demo[]"
        :customUpload="true"
        @select="previewFiles"
        @uploader="onAdvancedUpload"
        :multiple="true"
        accept="image/*"
        :maxFileSize="1000000"
      >
        <template #empty>
          <span>Drag and drop files here to upload.</span>
        </template>
      </FileUpload>
  
      <div v-if="previews.length" class="previews">
        <h3>File Previews</h3>
        <div v-for="(file, index) in previews" :key="index">
          <img :src="file.preview" :alt="file.name" class="preview-image" />
          <p>{{ file.name }} ({{ file.size }} KB)</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useToast } from 'primevue/usetoast';
  
  const toast = useToast();
  const previews = ref([]);
  
  // Preview selected files locally
  function previewFiles(event) {
    previews.value = [...event.files].map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2),
      preview: URL.createObjectURL(file),
    }));
    toast.add({
      severity: 'info',
      summary: 'Files Selected',
      detail: `${event.files.length} file(s) selected`,
      life: 3000,
    });
  }
  
  // Handle custom upload (local logic)
  function onAdvancedUpload(event) {
    console.log('Files ready for processing:', event.files);
    toast.add({
      severity: 'success',
      summary: 'Upload Successful',
      detail: 'Files processed locally',
      life: 3000,
    });
  
    // Optionally revoke object URLs to avoid memory leaks
    setTimeout(() => {
      previews.value.forEach((file) => URL.revokeObjectURL(file.preview));
    }, 5000); // Revoke after a delay
  }
  </script>
  
  <style scoped>
  .card {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .previews img {
    max-width: 100px;
    margin: 10px 0;
    display: block;
  }
  
  .preview-image {
    max-width: 100px;
    margin: 10px 0;
    border: 1px solid #ccc;
    padding: 5px;
  }
  </style>
  
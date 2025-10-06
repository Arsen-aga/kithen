<script setup>
import { computed } from 'vue'
import DragDropImages from '@/components/UI/DragDropImages.vue'
import AdminAddVideo from '@/components/UI/AdminAddVideo.vue'

const props = defineProps({
  images: Array,
  video: Object,
})

const emit = defineEmits(['update:images', 'update:video', 'remove-image', 'remove-video'])

const localImages = computed({
  get: () => props.images,
  set: (value) => emit('update:images', value),
})

const localVideo = computed({
  get: () => props.video,
  set: (value) => emit('update:video', value),
})
</script>
<template>
  <div>
    <!-- Изображения -->
    <div class="editor-section">
      <h3 class="section-title">Изображения</h3>
      <div class="attributes-container">
        <div class="form-group">
          <DragDropImages
            v-model="localImages"
            :multiple="true"
            @remove-image="(event) => emit('remove-image', event)"
          />
        </div>
      </div>
    </div>

    <!-- Видео -->
    <div class="editor-section">
      <h3 class="section-title">Видео</h3>
      <div class="attributes-container">
        <div class="form-group">
          <AdminAddVideo v-model="localVideo" @remove-video="$emit('remove-video', $event)" />
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.editor-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e5e9;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f2f5;
}
/* Стили для атрибутов */
.attributes-container {
  space-y: 24px;
}

.form-group {
  margin-bottom: 0;
}
</style>

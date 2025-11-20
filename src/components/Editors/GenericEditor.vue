<script setup>
import { computed } from 'vue'
import ActionButtons from '@/components/UI/ActionButtons.vue'
import DragDropImages from '@/components/UI/DragDropImages.vue'

const props = defineProps({
  formData: Object,
  entityType: String,
  currentId: String,
})

const emit = defineEmits(['save', 'cancel', 'remove-image', 'update:images'])

console.log(props.formData)
console.log(props.formData.images)

const config = computed(() => {
  const configs = {
    'product-groups': {
      title: 'Группа товаров',
      label: 'Название группы',
      sort: 'Порядок группы',
      placeholder: 'Введите название группы товаров',
      hint: 'Например: Электроника, Одежда, Мебель и т.д.',
      entityType: 'группу',
    },
    'product-attribute-groups': {
      title: 'Группа атрибутов',
      label: 'Название группы атрибутов',
      sort: '',
      placeholder: 'Введите название группы атрибутов',
      hint: 'Например: Цвет, Размер, Материал и т.д.',
      entityType: 'группу атрибутов',
    },
  }

  return (
    configs[props.entityType] || {
      title: 'Редактор',
      label: 'Название',
      placeholder: 'Введите название',
      hint: '',
      entityType: 'элемент',
    }
  )
})

const localImages = computed({
  get: () => {
    if (typeof props.formData.photo === 'string' && props.formData.photo) {
      return [
        {
          id: props.currentId === 'new' ? Date.now() : props.currentId,
          url: props.formData.photo,
          nameUrl: props.formData.photo.split('/').pop(),
          name: props.formData.photo.split('/').pop(),
          isExisting: true,
        },
      ]
    } else if (Array.isArray(props.formData.photo)) {
      return props.formData.photo
    } else {
      return []
    }
  },
  set: (value) => emit('update:images', value),
})
</script>
<template>
  <div class="content-editor">
    <div class="editor-section">
      <h3 class="section-title">{{ config.title }}</h3>
      <div
        :class="{
          'form-single': props.entityType !== 'product-groups',
          'form-grid': props.entityType === 'product-groups',
        }"
      >
        <div class="form-group">
          <label for="title" class="form-label">{{ config.label }}</label>
          <input type="text" id="title" v-model="formData.title" :placeholder="config.placeholder" class="form-input" />
          <div class="form-hint">{{ config.hint }}</div>
        </div>
        <div class="form-group" v-if="props.entityType === 'product-groups'">
          <label for="sort" class="form-label">{{ config.sort }}</label>
          <input type="number" id="sort" min="0" v-model="formData.sort" class="form-input" />
        </div>
      </div>
    </div>
    <!-- Изображение -->
    <div v-if="props.entityType === 'product-groups' && !formData.parent_id" class="editor-section">
      <h3 class="section-title">Изображение</h3>
      <div class="attributes-container">
        <div class="form-group">
          <DragDropImages
            v-model="localImages"
            :multiple="false"
            @update:images="(event) => emit('update:images', event)"
            @remove-image="(event) => emit('remove-image', event)"
          />
        </div>
      </div>
    </div>

    <ActionButtons
      :is-new="currentId === 'new'"
      :entity-type="entityType"
      @save="$emit('save')"
      @cancel="$emit('cancel')"
    />
  </div>
</template>
<style lang="scss" scoped>
.content-editor {
  max-width: 100%;
  padding: 0;
}
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-single {
  max-width: 500px;
}
.form-group {
  margin-bottom: 0;
}
.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #dba250;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
  line-height: 1.4;
}
</style>

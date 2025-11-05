<script setup>
import { computed, defineEmits } from 'vue'
import ActionButtons from '@/components/UI/ActionButtons.vue'
import DragDropImages from '@/components/UI/DragDropImages.vue'

const props = defineProps({
  formData: Object,
  entityType: String,
  currentId: String,
  categoriesList: {
    // Добавляем пропс для списка категорий
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['save', 'cancel', 'remove-image', 'update:images'])

const config = computed(() => {
  const configs = {
    'external-categories': {
      title: 'Категория товаров',
      label: 'Название категории',
      sort: 'Порядок категории',
      placeholder: 'Введите название категории товаров',
      hint: 'Например: Электроника, Одежда, Мебель и т.д.',
      entityType: 'категорию',
    },
    'external-product-attribute-groups': {
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
    // Если image - это строка (URL), преобразуем в массив с одним объектом
    if (typeof props.formData.image === 'string' && props.formData.image) {
      return [
        {
          id: props.currentId === 'new' ? Date.now() : props.currentId,
          url: props.formData.image,
          nameUrl: props.formData.image.split('/').pop(),
          name: props.formData.image.split('/').pop(),
          isExisting: true,
        },
      ]
    }
    // Если image - это массив, возвращаем как есть
    else if (Array.isArray(props.formData.image)) {
      return props.formData.image
    }
    // Если image null или undefined, возвращаем пустой массив
    else {
      return []
    }
  },
  set: (value) => {
    emit('update:images', value)
  },
})

const availableParentCategories = computed(() => {
  if (props.entityType !== 'external-categories') return []

  const currentId = props.currentId === 'new' ? null : parseInt(props.currentId)

  return props.categoriesList.filter((category) => {
    // Исключаем текущую категорию
    if (category.id === currentId) return false

    // Исключаем дочерние категории (чтобы избежать циклических ссылок)
    const isChild = checkIfChild(category, currentId, props.categoriesList)
    if (isChild) return false

    return true
  })
})

// Рекурсивная функция для проверки, является ли категория дочерней
const checkIfChild = (category, targetId, allCategories) => {
  if (!category.children || category.children.length === 0) return false

  for (const child of category.children) {
    if (child.id === targetId) return true
    if (checkIfChild(child, targetId, allCategories)) return true
  }

  return false
}

// Получаем отображаемое название категории с учетом вложенности
const getCategoryDisplayName = (category, level = 0) => {
  const prefix = '— '.repeat(level)
  return `${prefix}${category.title || category.Name || category.name}`
}

// Рекурсивно формируем плоский список категорий с отступами
const flattenedCategories = computed(() => {
  const result = []

  const flatten = (categories, level = 0) => {
    categories.forEach((category) => {
      result.push({
        ...category,
        displayName: getCategoryDisplayName(category, level),
      })

      if (category.children && category.children.length > 0) {
        flatten(category.children, level + 1)
      }
    })
  }

  // Начинаем с корневых категорий (у которых parent_id === null)
  const rootCategories = availableParentCategories.value.filter((cat) => cat.parent_id === null)
  flatten(rootCategories)

  return result
})
</script>
<template>
  <div class="content-editor">
    <div class="editor-section">
      <h3 class="section-title">{{ config.title }}</h3>
      <div
        :class="{
          'form-single': props.entityType !== 'external-categories',
          'form-grid': props.entityType === 'external-categories',
        }"
      >
        <div class="form-group">
          <label for="title" class="form-label">{{ config.label }}</label>
          <input type="text" id="title" v-model="formData.title" :placeholder="config.placeholder" class="form-input" />
          <div class="form-hint">{{ config.hint }}</div>
        </div>
        <div class="form-group" v-if="props.entityType === 'external-categories'">
          <label for="sort" class="form-label">{{ config.sort }}</label>
          <input type="number" id="sort" min="0" v-model="formData.sort" class="form-input" />
        </div>
      </div>
      <!-- Поле выбора родительской категории -->
      <div class="form-group" v-if="props.entityType === 'external-categories'">
        <label for="parent_id" class="form-label">Родительская категория</label>
        <select id="parent_id" v-model="formData.parent_id" class="form-input">
          <option :value="null">Без родительской категории (корневая)</option>
          <option v-for="category in flattenedCategories" :key="category.id" :value="category.id">
            {{ category.displayName }}
          </option>
        </select>
        <div class="form-hint">
          Выберите родительскую категорию для создания иерархии. Текущая категория и ее дочерние категории исключены из
          списка.
        </div>
      </div>
    </div>
    <!-- Изображение -->
    <div v-if="props.entityType === 'external-categories' && !formData.parent_id" class="editor-section">
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

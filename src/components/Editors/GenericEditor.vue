<script setup>
import { computed, defineEmits, ref } from 'vue'
import ActionButtons from '@/components/UI/ActionButtons.vue'
import DragDropImages from '@/components/UI/DragDropImages.vue'

const props = defineProps({
  formData: Object,
  entityType: String,
  currentId: String,
  categoriesList: {
    type: Array,
    default: () => [],
  },
  groupsAttribute: {
    type: Array,
    default: () => [],
  },
  selectedAttributeGroups: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['save', 'cancel', 'remove-image', 'update:images'])

const selectedGroup = ref(null)
const showNewGroupForm = ref(false)
const newGroupName = ref('')
const newGroupRequire = ref(false)

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

    <!-- Группы атрибутов для категорий -->
    <div v-if="entityType === 'external-categories'" class="editor-section">
      <h3 class="section-title">Группы атрибутов для категории</h3>
      <div class="attributes-container">
        <!-- Выбор существующей группы атрибутов -->
        <div class="form-group">
          <label class="form-label">Выберите существующую группу атрибутов</label>
          <div class="select-wrapper">
            <select v-model="selectedGroup" class="form-select">
              <option :value="null">Выберите группу атрибутов</option>
              <option v-for="group in groupsAttribute" :key="group.id" :value="group.id">
                {{ group.Name || group.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Кнопки добавления групп -->
        <div class="form-group button-group">
          <button type="button" class="btn btn-secondary" @click="addAttributeGroup" :disabled="!selectedGroup">
            Добавить выбранную группу
          </button>
          <span class="button-divider">или</span>
          <button type="button" class="btn btn-primary" @click="toggleNewGroupForm">
            {{ showNewGroupForm ? 'Отмена' : 'Создать новую группу' }}
          </button>
        </div>

        <!-- Форма создания новой группы -->
        <div v-if="showNewGroupForm" class="new-group-form">
          <div class="form-group">
            <label class="form-label">Название новой группы атрибутов</label>
            <input type="text" v-model="newGroupName" placeholder="Введите название группы" class="form-input" />
          </div>
          <div class="form-group">
            <label class="checkbox-label large">
              <input type="checkbox" v-model="newGroupRequire" />
              <span class="checkmark"></span>
              Обязательная группа атрибутов
            </label>
            <div class="form-hint">
              Если отмечено, все товары в этой категории должны будут иметь атрибуты из этой группы
            </div>
          </div>
          <div class="form-group">
            <button
              type="button"
              class="btn btn-success"
              @click="createNewAttributeGroup"
              :disabled="!newGroupName.trim()"
            >
              Создать и добавить группу
            </button>
          </div>
        </div>

        <!-- Список выбранных групп атрибутов -->
        <div class="selected-groups" v-if="selectedAttributeGroups.length > 0">
          <h4 class="sub-section-title">Выбранные группы атрибутов:</h4>
          <div class="selected-groups-list">
            <div
              v-for="(group, index) in selectedAttributeGroups"
              :key="group.group_id"
              class="selected-group-item"
              :class="{ 'new-group': group.isNew }"
            >
              <div class="group-info">
                <span class="group-name">
                  {{ group.isNew ? group.name : getGroupName(group.group_id) }}
                  <span v-if="group.isNew" class="new-badge">новая</span>
                </span>
                <label class="checkbox-label" v-if="!group.inherited">
                  <input
                    type="checkbox"
                    :checked="group.require"
                    @change="updateGroupRequire(index, $event.target.checked)"
                  />
                  <span class="checkmark"></span>
                  Обязательная
                </label>
                <span v-else class="inherited-require">
                  {{ group.require ? 'Обязательная' : 'Необязательная' }} (наследование)
                </span>
              </div>
              <button
                type="button"
                class="btn btn-danger btn-sm"
                v-if="!group.inherited"
                @click="removeAttributeGroup(index)"
              >
                Удалить
              </button>
              <span v-else class="inherited-note">Унаследована</span>
            </div>
          </div>
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

/* Стили для кнопок */
.button-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.button-divider {
  color: #6b7280;
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

/* Форма новой группы */
.new-group-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-top: 15px;
}

/* Список выбранных групп */
.selected-groups {
  margin-top: 20px;
}

.sub-section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.selected-groups-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;

  &.new-group {
    background: #fff3cd;
    border-color: #ffeaa7;
  }
}

.group-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.group-name {
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-badge {
  background: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Чекбоксы */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  margin-top: 10px;

  &.large {
    font-size: 16px;
    font-weight: 500;
  }
}

.checkbox-label input[type='checkbox'] {
  margin: 0;
}

.inherited-group {
  background-color: #f8f9fa;
  border-left: 4px solid #6c757d;
}

.inherited-badge {
  background-color: #6c757d;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75em;
  margin-left: 8px;
}

.new-badge {
  background-color: #28a745;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75em;
  margin-left: 8px;
}

.inherited-require {
  color: #6c757d;
  font-style: italic;
  font-size: 0.9em;
}

.inherited-note {
  color: #6c757d;
  font-style: italic;
  font-size: 0.9em;
}
</style>

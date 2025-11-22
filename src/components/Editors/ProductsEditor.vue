<script setup>
import AttributesManager from '@/components/Editors/AttributesManager.vue'
import MediaSection from '@/components/Editors/MediaSection.vue'
import ActionButtons from '@/components/UI/ActionButtons.vue'
import SearchList from '@/components/UI/SearchList.vue'
import { useAttributes } from '@/helpers/useAttributes'
import { ref, computed } from 'vue'

const props = defineProps({
  formData: Object,
  groupsProduct: Array,
  groupsAttribute: Array,
  filteredAttributes: Array,
  selectedAttributes: Array,
  attributesLoaded: Boolean,
  currentId: String,
  getAttributeName: Function,
})
const emit = defineEmits([
  'save',
  'update:group-attribute',
  'remove-image',
  'remove-video',
  'update:selected-attributes',
  'remove-attribute',
  'update:images',
  'update:video',
])
const { getAllGroupsAttribute } = useAttributes()

const currentGroup = computed(() => {
  const selectedGroup = props.groupsAttribute.value?.find((group) => group.id === props.formData.groupAttribute)
  return (
    selectedGroup || {
      id: 0,
      name: 'Выберите группу атрибутов',
    }
  )
})

const defaultGroup = ref({
  id: 0,
  name: 'Выберите группу атрибутов',
})

const handleGroupSelect = (group) => {
  props.formData.groupAttribute = group.id
  emit('update:group-attribute', group.id)
}
</script>

<template>
  <div class="content-editor">
    <!-- Основная информация -->
    <div class="editor-section">
      <h3 class="section-title">Основная информация</h3>
      <div class="form-grid">
        <div class="form-group">
          <label for="title" class="form-label">Наименование товара</label>
          <input
            type="text"
            id="title"
            v-model="formData.title"
            placeholder="Введите название товара"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="group" class="form-label">Категория товара</label>
          <div class="select-wrapper">
            <select id="group" v-model="formData.groupProduct" class="form-select">
              <option :value="null">Выберите категорию товара</option>
              <option v-for="group in groupsProduct" :key="group.id" :value="group.id">
                {{ group.Name || group.title }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group full-width">
          <label for="description" class="form-label">Описание</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Описание товара"
            class="form-textarea"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Атрибуты товара -->
    <div class="editor-section">
      <h3 class="section-title">Атрибуты товара</h3>
      <div class="attributes-container">
        <!-- Выбор группы атрибутов -->
        <div class="form-group">
          <label class="form-label">Группа атрибутов</label>
          <SearchList
            :get-more-items="getAllGroupsAttribute"
            :current-item="currentGroup"
            :default-item="defaultGroup"
            @change-item="handleGroupSelect"
          />
          <div class="select-wrapper">
            <select
              v-model="formData.groupAttribute"
              @change="$emit('update:group-attribute', formData.groupAttribute)"
              class="form-select"
            >
              <option :value="null">Выберите группу атрибутов</option>
              <option v-for="group in groupsAttribute" :key="group.id" :value="group.id">
                {{ group.Name || group.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Объединенный компонент атрибутов -->
        <AttributesManager
          :attributes="filteredAttributes"
          :selected-attributes="selectedAttributes"
          :attributes-loaded="attributesLoaded"
          :get-attribute-name="getAttributeName"
          @update:selected-attributes="(event) => emit('update:selected-attributes', event)"
          @remove-attribute="(event) => emit('remove-attribute', event)"
        />
      </div>
    </div>

    <!-- Медиа -->
    <MediaSection
      :images="formData.images"
      :video="formData.video"
      @update:video="(event) => emit('update:video', event)"
      @update:images="(event) => emit('update:images', event)"
      @remove-image="(event) => emit('remove-image', event)"
      @remove-video="$emit('remove-video', $event)"
    />

    <!-- Кнопки действий -->
    <ActionButtons :is-new="currentId === 'new'" entity-type="товар" @save="$emit('save')" @cancel="$emit('cancel')" />
  </div>
</template>

<style scoped>
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

.form-textarea {
  resize: none;
  min-height: 100px;
  font-family: inherit;
}

.select-wrapper {
  position: relative;
}
</style>

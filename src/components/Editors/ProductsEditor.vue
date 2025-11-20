<script setup>
import MediaSection from './MediaSection.vue'
import ActionButtons from '../UI/ActionButtons.vue'
import AttributesManager from './AttributesManager.vue'
import { computed, ref } from 'vue'

const props = defineProps({
  formData: Object,
  groupsProduct: Array,
  groupsAttribute: Array,
  selectedAttributes: Array,
  currentId: String,
  getAttributeName: Function,
  categoryAttributeGroups: {
    type: Array,
    default: () => [],
  },
  loadAttributesForGroup: {
    type: Function,
    required: true,
  },
  createNewAttribute: {
    type: Function,
    required: true,
  },
  loadingAttributes: {
    type: Object,
    default: () => ({}),
  },
  additionalAttributes: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'save',
  'remove-image',
  'remove-video',
  'update:selected-attributes',
  'remove-attribute',
  'update:images',
  'update:video',
  'add-additional-attribute',
  'remove-additional-attribute',
  'additional-group-select',
  'additional-attribute-select',
  'create-additional-attribute',
  'cancel-additional-attribute',
])

// Локальные состояния для управления атрибутами
const newAttributeInputs = ref({})
const showNewAttributeInputs = ref({})
const selectedAttributesByGroup = ref({})
const loadedAttributesByGroup = ref({}) // Кэш загруженных атрибутов

// Вычисляем группы атрибутов для текущей категории
const categoryAttributeGroupsList = computed(() => {
  if (!props.formData.groupProduct || !props.categoryAttributeGroups.length) return []

  // Фильтруем дубликаты
  const uniqueGroups = props.categoryAttributeGroups.reduce((acc, group) => {
    const existingGroup = acc.find((g) => g.external_attribute_group_id === group.external_attribute_group_id)

    if (!existingGroup) {
      acc.push(group)
    }
    return acc
  }, [])

  return uniqueGroups.map((group) => {
    const groupInfo = props.groupsAttribute.find((g) => g.id === group.external_attribute_group_id)
    return {
      ...group,
      name: groupInfo ? groupInfo.Name || groupInfo.name : `Группа ${group.external_attribute_group_id}`,
      require: group.require === 1,
      groupId: group.external_attribute_group_id,
    }
  })
})

// Получаем название текущей категории
const getCurrentCategoryName = computed(() => {
  if (!props.formData.groupProduct) return ''
  const category = props.groupsProduct.find((cat) => cat.id === props.formData.groupProduct)
  return category ? category.Name || category.title : ''
})

// Обработчик открытия селекта (ленивая загрузка)
const handleSelectFocus = async (groupId) => {
  console.log('groupId', groupId)
  // Если атрибуты для этой группы еще не загружены, загружаем их
  if (!loadedAttributesByGroup.value[Number(groupId)]) {
    const attributes = await props.loadAttributesForGroup(Number(groupId))
    // СОХРАНЯЕМ загруженные атрибуты в кэш
    loadedAttributesByGroup.value[Number(groupId)] = attributes
    console.log(`Загружены атрибуты для группы ${Number(groupId)}:`, attributes)
  }
}

// Получаем атрибуты для группы (из кэша)
const getAttributesForGroup = (groupId) => {
  return loadedAttributesByGroup.value[groupId] || []
}

// Обработчик выбора атрибута из селекта категории
const handleAttributeSelect = (group, attributeId) => {
  if (!attributeId) return

  if (attributeId !== 'new') {
    if (!props.selectedAttributes.includes(attributeId)) {
      const newSelectedAttributes = [...props.selectedAttributes, attributeId]
      emit('update:selected-attributes', newSelectedAttributes)
    }
    selectedAttributesByGroup.value[group.external_attribute_group_id] = attributeId
  } else {
    console.log('group', group)
    console.log('attributeId', attributeId)
    showNewAttributeInputs.value[group.external_attribute_group_id] = true
    newAttributeInputs.value[group.external_attribute_group_id] = ''
  }
}

// Обработчик создания нового атрибута в категории
const handleCreateNewAttribute = async (group) => {
  const attributeName = newAttributeInputs.value[group.external_attribute_group_id]?.trim()
  if (!attributeName) return

  try {
    const newAttribute = await props.createNewAttribute(group.external_attribute_group_id, attributeName)

    if (!props.selectedAttributes.includes(newAttribute.id)) {
      const newSelectedAttributes = [...props.selectedAttributes, newAttribute.id]
      emit('update:selected-attributes', newSelectedAttributes)
    }

    // Обновляем кэш атрибутов для этой группы
    if (loadedAttributesByGroup.value[group.external_attribute_group_id]) {
      loadedAttributesByGroup.value[group.external_attribute_group_id].push(newAttribute)
    }

    showNewAttributeInputs.value[group.external_attribute_group_id] = false
    newAttributeInputs.value[group.external_attribute_group_id] = ''
    selectedAttributesByGroup.value[group.external_attribute_group_id] = newAttribute.id
  } catch (error) {
    console.error('Ошибка создания атрибута:', error)
  }
}

// Отмена создания нового атрибута в категории
const cancelNewAttribute = (group) => {
  showNewAttributeInputs.value[group.external_attribute_group_id] = false
  newAttributeInputs.value[group.external_attribute_group_id] = ''
  selectedAttributesByGroup.value[group.external_attribute_group_id] = ''
}

// Обработчики для дополнительных атрибутов
const handleAdditionalGroupSelect = async (index, groupId) => {
  emit('additional-group-select', index, groupId)
}

const handleAdditionalAttributeSelect = (index, attributeId) => {
  emit('additional-attribute-select', index, attributeId)
}

const handleCreateAdditionalAttribute = (index) => {
  emit('create-additional-attribute', index)
}

const handleCancelAdditionalAttribute = (index) => {
  emit('cancel-additional-attribute', index)
}

const handleRemoveAdditionalAttribute = (index) => {
  emit('remove-additional-attribute', index)
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

        <div class="form-group">
          <label for="price" class="form-label">Цена товара</label>
          <input type="text" id="price" v-model="formData.price" placeholder="Введите цену товара" class="form-input" />
        </div>
        <div class="form-group">
          <label for="short_description" class="form-label">Краткое описание</label>
          <input
            type="text"
            id="short_description"
            v-model="formData.short_description"
            placeholder="Введите цену товара"
            class="form-input"
          />
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

      <!-- Группы атрибутов из категории -->
      <div v-if="categoryAttributeGroupsList.length > 0" class="category-attributes-section">
        <div class="section-subtitle">Атрибуты из категории "{{ getCurrentCategoryName }}"</div>

        <div class="attribute-groups-container">
          <div
            v-for="group in categoryAttributeGroupsList"
            :key="group.external_attribute_group_id"
            class="attribute-group-item"
          >
            <div class="group-header">
              <span class="group-name">{{ group.name }}</span>
              <span v-if="group.require" class="require-badge">обязательный</span>
            </div>

            <div class="group-controls">
              <!-- Селект с атрибутами группы -->
              <div class="select-wrapper">
                <select
                  :value="selectedAttributesByGroup[group.external_attribute_group_id]"
                  @change="handleAttributeSelect(group, $event.target.value)"
                  @focus="handleSelectFocus(group.external_attribute_group_id)"
                  class="form-select attribute-select"
                  :disabled="loadingAttributes[group.external_attribute_group_id]"
                >
                  <option value="">Выберите атрибут</option>
                  <option
                    v-for="attr in getAttributesForGroup(group.external_attribute_group_id)"
                    :key="attr.id"
                    :value="attr.id"
                  >
                    {{ attr.attribute_value || attr.name }}
                  </option>
                  <option value="new">+ Добавить новый атрибут</option>
                </select>
                <div v-if="loadingAttributes[group.external_attribute_group_id]" class="select-loading">
                  Загрузка...
                </div>
              </div>

              <!-- Поле для ввода нового атрибута -->
              <div v-if="showNewAttributeInputs[group.external_attribute_group_id]" class="new-attribute-input">
                <input
                  type="text"
                  v-model="newAttributeInputs[group.external_attribute_group_id]"
                  placeholder="Введите название атрибута"
                  class="form-input"
                  @keyup.enter="handleCreateNewAttribute(group)"
                />
                <div class="new-attribute-actions">
                  <button
                    @click="handleCreateNewAttribute(group)"
                    class="btn btn-success btn-sm"
                    :disabled="!newAttributeInputs[group.external_attribute_group_id]?.trim()"
                  >
                    Добавить
                  </button>
                  <button @click="cancelNewAttribute(group)" class="btn btn-secondary btn-sm">Отмена</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Дополнительные атрибуты -->
      <div class="additional-attributes-section">
        <div class="section-subtitle">Дополнительные атрибуты</div>

        <!-- Кнопка добавления дополнительного атрибута -->
        <div class="add-attribute-button">
          <button @click="$emit('add-additional-attribute')" class="btn btn-primary">+ Добавить атрибут</button>
        </div>

        <!-- Список дополнительных атрибутов -->
        <div class="additional-attributes-list">
          <div v-for="(attr, index) in additionalAttributes" :key="attr.id" class="additional-attribute-item">
            <div class="additional-attribute-controls">
              <!-- Селект группы -->
              <div class="group-select">
                <label class="form-label">Группа атрибутов</label>
                <select
                  :value="attr.group_id"
                  @change="handleAdditionalGroupSelect(index, $event.target.value)"
                  class="form-select"
                >
                  <option :value="null">Выберите группу</option>
                  <option v-for="group in groupsAttribute" :key="group.id" :value="group.id">
                    {{ group.Name || group.name }}
                  </option>
                </select>
              </div>

              <!-- Селект атрибута (показывается только если выбрана группа) -->
              <div v-if="attr.group_id" class="attribute-select-container">
                <label class="form-label">Атрибут</label>
                <div class="attribute-select-with-button">
                  <select
                    :value="attr.attribute_id"
                    @change="handleAdditionalAttributeSelect(index, $event.target.value)"
                    @focus="handleSelectFocus(attr.group_id)"
                    class="form-select"
                    :disabled="loadingAttributes[attr.group_id]"
                  >
                    <option value="">Выберите атрибут</option>
                    <option
                      v-for="attribute in getAttributesForGroup(attr.group_id)"
                      :key="attribute.id"
                      :value="attribute.id"
                    >
                      {{ attribute.attribute_value || attribute.name }}
                    </option>
                    <option value="new">+ Добавить новый атрибут</option>
                  </select>
                  <button
                    v-if="attr.attribute_id && attr.attribute_id !== 'new'"
                    @click="handleRemoveAdditionalAttribute(index)"
                    class="btn-remove-additional"
                    title="Удалить этот атрибут"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <!-- Поле для ввода нового атрибута -->
            <div v-if="attr.show_new_input" class="new-additional-attribute-input">
              <label class="form-label">Новый атрибут</label>
              <div class="new-attribute-input-with-actions">
                <input
                  type="text"
                  v-model="attr.new_attribute_name"
                  placeholder="Введите название атрибута"
                  class="form-input"
                  @keyup.enter="handleCreateAdditionalAttribute(index)"
                />
                <div class="new-attribute-actions">
                  <button
                    @click="handleCreateAdditionalAttribute(index)"
                    class="btn btn-success btn-sm"
                    :disabled="!attr.new_attribute_name?.trim()"
                  >
                    Добавить
                  </button>
                  <button @click="handleCancelAdditionalAttribute(index)" class="btn btn-secondary btn-sm">
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Компонент для отображения выбранных атрибутов -->
      <AttributesManager
        :attributes="[]"
        :selected-attributes="selectedAttributes"
        :attributes-loaded="true"
        :get-attribute-name="getAttributeName"
        @update:selected-attributes="(event) => $emit('update:selected-attributes', event)"
        @remove-attribute="(event) => $emit('remove-attribute', event)"
      />

      <!-- Сообщение если нет категории и дополнительных атрибутов -->
      <div v-if="!formData.groupProduct && additionalAttributes.length === 0" class="no-attributes-message">
        Выберите категорию товара, чтобы увидеть доступные атрибуты
      </div>
    </div>

    <!-- Медиа -->
    <MediaSection
      :images="formData.images"
      :video="formData.video"
      @update:video="(event) => $emit('update:video', event)"
      @update:images="(event) => $emit('update:images', event)"
      @remove-image="(event) => $emit('remove-image', event)"
      @remove-video="$emit('remove-video', $event)"
    />

    <!-- Кнопки действий -->
    <ActionButtons :is-new="currentId === 'new'" entity-type="товар" @save="$emit('save')" @cancel="$emit('cancel')" />
  </div>
</template>

<style lang="scss" scoped>
.full-width {
  grid-column: span 2;
}

.form-textarea {
  resize: vertical;
}
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

.section-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
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
  box-shadow: 0 0 0 3px rgba(219, 162, 80, 0.1);
}

/* Стили для групп атрибутов */
.category-attributes-section {
  margin-bottom: 24px;
}

.attribute-groups-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.attribute-group-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
}

.group-header {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.require-badge {
  background: #dc3545;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  align-self: flex-start;
}

.group-controls {
  flex: 1;
  min-width: 0;
}

.select-wrapper {
  position: relative;
}

.attribute-select {
  min-width: 250px;
}

.select-loading {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #6c757d;
}

/* Стили для нового атрибута */
.new-attribute-input {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.new-attribute-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

/* Стили для выбранных атрибутов */
.selected-attributes-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.selected-attributes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-attribute-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  font-size: 14px;
}

.attribute-name {
  color: #0066cc;
  font-weight: 500;
}

.btn-remove-attribute {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background: #dc3545;
    color: white;
  }
}

.no-attributes-message {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
}

/* Стили для дополнительных атрибутов */
.additional-attributes-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.add-attribute-button {
  margin-bottom: 16px;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.additional-attributes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.additional-attribute-item {
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.additional-attribute-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.attribute-select-with-button {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.attribute-select-with-button .form-select {
  flex: 1;
}

.btn-remove-additional {
  background: #dc3545;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
}

.new-additional-attribute-input {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.new-attribute-input-with-actions {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.new-attribute-input-with-actions .form-input {
  flex: 1;
}
</style>

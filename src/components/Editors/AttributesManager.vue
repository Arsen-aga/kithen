<script setup>
import { useApi } from '@/helpers/useApi'
import { onMounted, ref, watch } from 'vue'

const { get } = useApi()

const props = defineProps({
  attributes: Array,
  selectedAttributes: {
    type: Array,
    default: () => [],
  },
  attributesLoaded: Boolean,
  getAttributeName: Function,
})

const emit = defineEmits(['update:selected-attributes', 'remove-attribute'])

// Локальная копия для реактивности
const localSelected = ref([...props.selectedAttributes])

// Обработчик изменения чекбокса
const handleCheckboxChange = (attributeId, isChecked) => {
  if (isChecked) {
    if (!localSelected.value.includes(attributeId)) {
      localSelected.value.push(attributeId)
    }
  } else {
    const index = localSelected.value.indexOf(attributeId)
    if (index > -1) {
      localSelected.value.splice(index, 1)
    }
  }

  // Эмитим новое значение
  emit('update:selected-attributes', [...localSelected.value])
}

// Обработчик удаления атрибута
const handleRemoveAttribute = (attribute) => {
  console.log('attribute', attribute)
  const index = localSelected.value.indexOf(attribute)
  console.log('localSelected.value', localSelected.value)
  console.log(index)
  if (index > -1) {
    localSelected.value.splice(index, 1)
    emit('update:selected-attributes', [...localSelected.value])
    emit('remove-attribute', attribute)
  }
}

// Следим за изменениями извне и синхронизируем
watch(
  () => props.selectedAttributes,
  (newVal) => {
    // Проверяем, что массивы действительно отличаются
    if (JSON.stringify(localSelected.value) !== JSON.stringify(newVal)) {
      localSelected.value = [...newVal]
    }
  },
  { deep: true }
)

// Проверяем, выбран ли атрибут
const isAttributeSelected = (attributeId) => {
  console.log(attributeId)
  console.log(localSelected.value)
  return localSelected.value.includes(attributeId)
}
</script>

<template>
  <!-- Блок выбора атрибутов -->
  <div class="attributes-selector" v-if="attributes.length > 0">
    <label class="form-label">Доступные атрибуты</label>
    <div class="attributes-grid">
      <div v-for="attribute in attributes" :key="attribute.attribute_id || attribute.id" class="attribute-card">
        <label class="attribute-checkbox">
          <input
            type="checkbox"
            :value="attribute.attribute_id || attribute.id"
            :checked="isAttributeSelected(attribute)"
            @change="handleCheckboxChange(attribute, $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkbox-custom"></span>
          <span class="attribute-name">{{ attribute.Name || attribute.name || attribute.attribute_value }}</span>
        </label>
      </div>
    </div>
  </div>
  <!-- Блок выбранных атрибутов -->
  <div class="selected-attributes-section" v-if="localSelected.length > 0">
    <div class="selected-header">
      <h4 class="selected-title">Выбранные атрибуты</h4>
      <span class="selected-count">{{ localSelected.length }}</span>
    </div>
    <div class="selected-attributes-grid">
      <div
        v-for="attribute in localSelected"
        :key="attribute.attribute_id || attribute.id"
        class="selected-attribute-card"
      >
        <div class="attribute-badge">
          <span class="badge-text">{{ getAttributeName(attribute.attribute_id || attribute.id) }}</span>
          <button @click="handleRemoveAttribute(attribute)" class="badge-remove" title="Удалить атрибут">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.attributes-selector {
  margin-top: 16px;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.attribute-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.attribute-card:hover {
  border-color: #dba250;
  background: #f0f9ff;
}

.attribute-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin: 0;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-custom {
  background: #dba250;
  border-color: #dba250;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 12px;
  font-weight: bold;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.attribute-name {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

/* Выбранные атрибуты */
.selected-attributes-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #f0f2f5;
}

.selected-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.selected-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.selected-count {
  background: #dba250;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.selected-attributes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attribute-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #dba250;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.badge-text {
  line-height: 1;
}

.badge-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.badge-remove:hover {
  background: rgba(244, 81, 81, 0.578);
}
</style>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  attributes: Array,
  selectedAttributes: {
    type: Array,
    default: () => [],
  },
  attributesLoaded: Boolean,
})

const emit = defineEmits(['update:selected-attributes'])

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
  return localSelected.value.includes(attributeId)
}
</script>

<template>
  <div class="attributes-selector" v-if="attributes.length > 0">
    <label class="form-label">Доступные атрибуты</label>
    <div class="attributes-grid">
      <div v-for="attribute in attributes" :key="attribute.id" class="attribute-card">
        <label class="attribute-checkbox">
          <input
            type="checkbox"
            :value="attribute.id"
            :checked="isAttributeSelected(attribute.id)"
            @change="handleCheckboxChange(attribute.id, $event.target.checked)"
            class="checkbox-input"
          />
          <span class="checkbox-custom"></span>
          <span class="attribute-name">{{ attribute.Name || attribute.name }}</span>
        </label>
      </div>
    </div>

    <!-- Отладочная информация -->
    <div class="debug-info" style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px">
      <small>Выбрано атрибутов: {{ localSelected.length }} ({{ localSelected.join(', ') }})</small>
    </div>
  </div>

  <div v-else-if="attributesLoaded" class="empty-state">
    <div class="empty-icon">📋</div>
    <p class="empty-text">Нет доступных атрибутов в выбранной группе</p>
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
/* Состояние пустого списка */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  margin: 0;
}
</style>

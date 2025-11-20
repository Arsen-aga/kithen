<script setup>
defineProps({
  selectedAttributes: Array,
  getAttributeName: Function,
})

defineEmits(['remove-attribute'])
</script>
<template>
  123
  <div class="selected-attributes-section">
    <div class="selected-header">
      <h4 class="selected-title">Выбранные атрибуты</h4>
      <span class="selected-count">{{ selectedAttributes.length }}</span>
    </div>
    <div class="selected-attributes-grid">
      <div v-for="attributeId in selectedAttributes" :key="attributeId" class="selected-attribute-card">
        <div class="attribute-badge">
          <span class="badge-text">{{ getAttributeName(attributeId) }}</span>
          <button @click="$emit('remove-attribute', attributeId)" class="badge-remove" title="Удалить атрибут">
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

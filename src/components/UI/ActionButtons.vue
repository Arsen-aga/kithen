<script setup>
defineProps({
  isNew: Boolean,
  entityType: {
    type: String,
    default: 'элемент',
  },
})

defineEmits(['save', 'cancel', 'test'])
</script>
<template>
  <div class="action-buttons">
    <button @click="$emit('save')" class="btn-primary">
      <span class="btn-icon">💾</span>
      {{ isNew ? `Создать ${entityType}` : `Сохранить ${entityType}` }}
    </button>

    <button @click="$emit('cancel')" class="btn-danger" v-if="entityType !== 'товар'">
      <span class="btn-icon">{{ isNew ? '←' : '🗑️' }}</span>
      {{ isNew ? 'Назад к списку' : `Удалить ${entityType}` }}
    </button>

    <button @click="$emit('test')" class="btn-secondary" v-if="$slots.test">
      <slot name="test"></slot>
    </button>
  </div>
</template>

<style lang="scss" scoped>
/* Кнопки действий */
.action-buttons {
  display: flex;
  gap: 12px;
  padding: 24px 0;
}
.btn-danger,
.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #dba250;
  color: white;
}

.btn-primary:hover {
  background: #fbaf45;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(246, 184, 59, 0.3);
}

.btn-danger {
  background: #e91111;
  color: white;
}

.btn-danger:hover {
  background: #f51717;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(246, 59, 87, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 16px;
}
</style>

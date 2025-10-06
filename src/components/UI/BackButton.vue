<script setup>
defineEmits(['click'])
</script>
<template>
  <div class="back-button">
    <button @click="$emit('click')" class="btn-back">
      <span class="btn-icon">←</span>
      Назад к списку
    </button>
  </div>
</template>

<style scoped>
.back-button {
  margin-bottom: 20px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-back:hover {
  background: #4b5563;
}

.btn-icon {
  font-size: 16px;
}
</style>

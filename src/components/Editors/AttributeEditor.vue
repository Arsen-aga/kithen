<script setup>
import ActionButtons from '../UI/ActionButtons.vue'

defineProps({
  formData: Object,
  groupsAttribute: Array,
  currentId: String,
})

defineEmits(['save', 'cancel'])
</script>
<template>
  <div class="content-editor">
    <div class="editor-section">
      <h3 class="section-title">Атрибут товара</h3>
      <div class="form-grid">
        <div class="form-group">
          <label for="title" class="form-label">Название атрибута</label>
          <input
            type="text"
            id="title"
            v-model="formData.title"
            placeholder="Введите название атрибута"
            class="form-input"
          />
          <div class="form-hint">Например: Красный, XL, Хлопок и т.д.</div>
        </div>

        <div class="form-group">
          <label for="group" class="form-label">Группа атрибутов</label>
          <div class="select-wrapper">
            <select id="group" v-model="formData.groupAttribute" class="form-select">
              <option :value="null">Выберите группу атрибутов</option>
              <option v-for="group in groupsAttribute" :key="group.id" :value="group.id">
                {{ group.Name || group.name }}
              </option>
            </select>
          </div>
          <div class="form-hint">Выберите к какой группе относится этот атрибут</div>
        </div>
      </div>
    </div>

    <ActionButtons
      :is-new="currentId === 'new'"
      entity-type="атрибут"
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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

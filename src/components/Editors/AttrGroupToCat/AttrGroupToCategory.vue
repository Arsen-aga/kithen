<script setup>
import { ref, defineProps, onMounted, defineEmits, watch, computed } from 'vue'
import SearchList from '@/components/UI/SearchList.vue'
import { useAttributes } from '@/helpers/useAttributes'

const {
  getAllGroupsAttribute,
  getCategoryAttributeGroups,
  createAttributeGroup,
  searchAllRequiredGroupsInCategoryLevel,
} = useAttributes()

const props = defineProps({
  entityType: String,
  id: String, // ID категории
  formData: Object,
})

const emit = defineEmits(['update:groups'])

/* --- LOCAL STATE --- */
const groups = ref([]) // все группы атрибутов
const selectedAttributeGroups = ref([]) // массив выбранных групп для категории
const parentAttributeGroups = ref([])

const defaultGroup = ref({
  id: null,
  name: 'Выберите группу атрибутов',
})
const currentGroup = ref(defaultGroup.value)

const showNewGroupForm = ref(false)
const newGroupName = ref('')
const newGroupRequire = ref(false)

/* -----------------------------
      ЗАГРУЗКА ДАННЫХ
------------------------------*/
const allAttributeGroups = computed(() => {
  const currentGroups = selectedAttributeGroups.value.map((group) => ({
    ...group,
    isEditable: true, // можно редактировать
    isInherited: false, // не унаследована
  }))

  const parentGroups = parentAttributeGroups.value.map((group) => ({
    ...group,
    isEditable: false, // нельзя редактировать
    isInherited: true, // унаследована
  }))

  return [...currentGroups, ...parentGroups]
})

const availableGroups = computed(() => {
  const allSelectedGroupIds = allAttributeGroups.value.map((g) => g.attribute_group_id)
  return groups.value.filter((group) => !allSelectedGroupIds.includes(group.id))
})

const loadGroups = async () => {
  groups.value = await getAllGroupsAttribute()
}

const loadCategoryGroups = async () => {
  if (!props.id) return

  const relations = await getCategoryAttributeGroups(props.id)
  // Преобразуем в формат для локального состояния
  selectedAttributeGroups.value = relations.map((relation) => ({
    id: relation.id, // ID связи
    attribute_group_id: relation.attribute_group_id,
    require: relation.require,
    isNew: false, // существующая группа
  }))
  emitGroupsUpdate()
}

const loadParentGroups = async () => {
  if (!props.formData) return

  const parentsGroups = await searchAllRequiredGroupsInCategoryLevel(props.formData)
  parentAttributeGroups.value = parentsGroups || []
}

const getGroupsForSearchList = async (params = {}) => {
  try {
    const { search = '', page = 1 } = params
    const groupsData = await getAllGroupsAttribute(search, page)
    return Array.isArray(groupsData) ? groupsData : []
  } catch (error) {
    console.error('Ошибка загрузки групп атрибутов:', error)
    return []
  }
}

const handleGroupSelect = (group) => {
  currentGroup.value = group
}

const filterGroups = (group) => {
  return availableGroups.value.some((available) => available.id === group.id)
}

/* -----------------------------
      ДОБАВЛЕНИЕ СУЩЕСТВУЮЩЕЙ ГРУППЫ
------------------------------*/
const addAttributeGroup = async () => {
  if (!currentGroup.value || !currentGroup.value.id) return

  const groupId = currentGroup.value.id

  // проверка, нет ли уже
  const exists = selectedAttributeGroups.value.some((g) => g.attribute_group_id == groupId)
  if (exists) return

  // Добавляем в локальный массив
  selectedAttributeGroups.value.push({
    id: null, // временный ID, будет установлен при сохранении
    attribute_group_id: groupId,
    require: false,
    isNew: true, // новая связь
  })

  currentGroup.value = defaultGroup.value
  emitGroupsUpdate()
}

/* -----------------------------
      СОЗДАНИЕ НОВОЙ ГРУППЫ
------------------------------*/
const createNewAttributeGroup = async () => {
  if (!newGroupName.value.trim()) return

  try {
    // Создаем новую группу
    const newGroup = await createAttributeGroup(newGroupName.value.trim())

    // Добавляем в список всех групп
    groups.value.push(newGroup)

    // Добавляем в выбранные группы
    selectedAttributeGroups.value.push({
      id: null, // временный ID
      attribute_group_id: newGroup.id,
      require: newGroupRequire.value,
      isNew: true,
    })

    // сброс формы
    newGroupName.value = ''
    newGroupRequire.value = false
    showNewGroupForm.value = false

    emitGroupsUpdate()
  } catch (error) {
    console.error('Ошибка создания группы:', error)
  }
}

/* -----------------------------
      ОБНОВЛЕНИЕ REQUIRE
------------------------------*/
const updateGroupRequire = (index, value) => {
  const editableIndex = selectedAttributeGroups.value.findIndex(
    (group) => group.attribute_group_id === allAttributeGroups.value[index].attribute_group_id
  )
  if (editableIndex !== -1) {
    selectedAttributeGroups.value[editableIndex].require = value
    emitGroupsUpdate()
  }
  emitGroupsUpdate()
}

/* -----------------------------
      УДАЛЕНИЕ ГРУППЫ
------------------------------*/
const removeAttributeGroup = (index) => {
  // Удаляем только из редактируемых групп
  const groupToRemove = allAttributeGroups.value[index]
  if (groupToRemove.isEditable) {
    const editableIndex = selectedAttributeGroups.value.findIndex(
      (group) => group.attribute_group_id === groupToRemove.attribute_group_id
    )

    if (editableIndex !== -1) {
      selectedAttributeGroups.value.splice(editableIndex, 1)
      emitGroupsUpdate()
    }
  }
}

const toggleNewGroupForm = () => {
  showNewGroupForm.value = !showNewGroupForm.value
  if (!showNewGroupForm.value) {
    newGroupName.value = ''
    newGroupRequire.value = false
  }
}

const getGroupName = (groupId) => {
  const group = groups.value.find((g) => g.id === groupId)
  return group?.name || 'Загрузка...'
}

// Эмитим обновленные группы наружу
const emitGroupsUpdate = () => {
  emit('update:groups', selectedAttributeGroups.value)
}

/* -----------------------------
      ВСПОМОГАТЕЛЬНОЕ
------------------------------*/

onMounted(async () => {
  await loadGroups()
  await loadCategoryGroups()
  await loadParentGroups()
})

// Следим за изменением ID категории
watch(
  () => props.id,
  async (newId) => {
    if (newId) {
      await loadCategoryGroups()
      await loadParentGroups()
    }
  }
)

watch(
  () => props.formData,
  async (newFormData) => {
    if (newFormData) {
      await loadParentGroups()
    }
  },
  { deep: true }
)
</script>

<template>
  <div v-if="entityType === 'product-groups'" class="editor-section">
    <h3 class="section-title">Группы атрибутов для категории {{ id }}</h3>
    <div class="attributes-container">
      <!-- Выбор существующей группы атрибутов -->
      <div class="form-group">
        <label class="form-label">Выберите существующую группу атрибутов</label>
        <SearchList
          :get-more-items="getGroupsForSearchList"
          :current-item="currentGroup"
          :default-item="defaultGroup"
          :search-placeholder="'Поиск группы атрибутов...'"
          :title-placeholder="'Выберите группу атрибутов'"
          :display-fields="['name']"
          :filter-fn="filterGroups"
          @change-item="handleGroupSelect"
        />
      </div>

      <!-- Кнопки добавления групп -->
      <div class="form-group button-group">
        <button type="button" class="btn btn-secondary" @click="addAttributeGroup" :disabled="!currentGroup.id">
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
      <div class="selected-groups" v-if="allAttributeGroups && allAttributeGroups.length > 0">
        <h4 class="sub-section-title">Группы атрибутов:</h4>
        <div class="selected-groups-list">
          <div
            v-for="(group, index) in allAttributeGroups"
            :key="index"
            class="selected-group-item"
            :class="{
              'editable-group': group.isEditable,
              'inherited-group': group.isInherited,
              'new-group': group.isNew,
            }"
          >
            <div class="group-info">
              <span class="group-name">
                {{ getGroupName(group.attribute_group_id) }}
                <span v-if="group.isNew" class="new-badge">новая</span>
                <span v-if="group.isInherited" class="inherited-badge">унаследована</span>
              </span>
              <label class="checkbox-label" v-if="group.isEditable">
                <input
                  type="checkbox"
                  :checked="group.require"
                  @change="updateGroupRequire(index, $event.target.checked)"
                />
                <span class="checkmark"></span>
                Обязательная
              </label>
              <span v-if="group.isInherited" class="inherited-require">
                {{ group.require ? 'Обязательная' : 'Необязательная' }} (наследование)
              </span>
            </div>
            <button
              type="button"
              class="btn btn-danger btn-sm"
              v-if="group.isEditable"
              @click="removeAttributeGroup(index)"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-groups-message">
        <p>Нет назначенных групп атрибутов. Добавьте группы атрибутов выше.</p>
      </div>
    </div>
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
  margin-bottom: 8px;

  &.new-group {
    background: #fff3cd;
    border-color: #ffeaa7;
    border-left: 4px solid #28a745;
  }
}

.group-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.editable-group {
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
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
  background-color: #f0f8ff;
  border-left: 4px solid #6c757d;
  opacity: 0.8;
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

.no-groups-message {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  font-style: italic;
}
</style>

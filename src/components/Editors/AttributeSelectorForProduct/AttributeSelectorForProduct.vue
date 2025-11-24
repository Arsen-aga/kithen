<script setup>
import SearchList from '@/components/UI/SearchList.vue'
import { useAttributes } from '@/helpers/useAttributes'
import { ref, watch } from 'vue'

const { getAllAttributes, getAllGroupsAttribute } = useAttributes()

const props = defineProps({
  groupData: Object,
  selectedAttribute: Object,
  allGroups: {
    type: Array,
    default: () => [],
  },
  allAttributes: {
    type: Array,
    default: () => [],
  },
  availableGroups: {
    type: Array,
    default: () => [],
  },
  isInherited: {
    type: Boolean,
    default: false,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:selected-attribute',
  'create:group',
  'create:attribute',
  'remove:group',
  'select:existing-group',
])

const defaultGroup = ref({
  id: null,
  name: 'Выберите группу атрибутов',
})
const defaultAttribute = ref({
  id: null,
  group_id: null,
  name: 'Выберите атрибут',
})
const currentAttribute = ref(defaultAttribute.value)
const currentGroup = ref(defaultGroup.value)
const isCreatingGroup = ref(false)
const isCreatingAttribute = ref(false)
const isSelectingExistingGroup = ref(false)
const newGroupName = ref('')
const newAttributeName = ref('')

const getAttributesForSearchList = async (params = {}) => {
  try {
    const { search = '', page = 1 } = params

    let attributes = await getAllAttributes(search, page)

    if (props.groupData.id) {
      attributes = attributes.filter((attr) => attr.group_id === props.groupData.id)
    }

    return Array.isArray(attributes) ? attributes : []
  } catch (error) {
    console.error('Ошибка загрузки атрибутов:', error)
    return []
  }
}

const getGroupsForSearchList = async (params = {}) => {
  try {
    const { search = '', page = 1 } = params
    const groups = await getAllGroupsAttribute(search, page)
    return Array.isArray(groups) ? groups : []
  } catch (error) {
    console.error('Ошибка загрузки групп атрибутов:', error)
    return []
  }
}

const getAvailableGroupsForSearchList = async (params = {}) => {
  try {
    const { search = '', page = 1 } = params
    // Используем доступные группы, переданные из родителя
    let groups = props.availableGroups
    console.log('groups', groups)

    // Фильтруем по поисковому запросу
    if (search) {
      const searchLower = search.toLowerCase()
      groups = groups.filter((group) => group.name.toLowerCase().includes(searchLower))
    }

    // Пагинация
    const pageSize = 10
    const startIndex = (page - 1) * pageSize
    const paginatedGroups = groups.slice(startIndex, startIndex + pageSize)

    return paginatedGroups
  } catch (error) {
    console.error('Ошибка загрузки доступных групп атрибутов:', error)
    return []
  }
}

const handleAttributeSelect = (attr) => {
  if (!attr || !attr.id) {
    currentAttribute.value = defaultAttribute.value
    emit('update:selected-attribute', null)
  } else {
    currentAttribute.value = attr
    emit('update:selected-attribute', attr)
  }
}

const handleGroupSelect = (group) => {
  if (group && group.id) {
    currentGroup.value = group
    props.groupData.id = group.id
    props.groupData.name = group.name
  }
}

// Выбор существующей группы
const handleExistingGroupSelect = (group) => {
  if (group && group.id) {
    emit('select:existing-group', group.id)
    isSelectingExistingGroup.value = false
  }
}

const startCreateGroup = () => {
  isCreatingGroup.value = true
  isSelectingExistingGroup.value = false
  newGroupName.value = ''
}

const startSelectExistingGroup = () => {
  isSelectingExistingGroup.value = true
  isCreatingGroup.value = false
}

const cancelCreateGroup = () => {
  isCreatingGroup.value = false
  isSelectingExistingGroup.value = false
  newGroupName.value = ''
}

const confirmCreateGroup = async () => {
  if (!newGroupName.value.trim()) return

  try {
    const newGroup = await emit('create:group', newGroupName.value.trim())
    if (newGroup) {
      currentGroup.value = newGroup
      props.groupData.id = newGroup.id
      props.groupData.name = newGroup.name
      isCreatingGroup.value = false
    }
  } catch (error) {
    console.error('Ошибка создания группы:', error)
  }
}

const startCreateAttribute = () => {
  isCreatingAttribute.value = true
  newAttributeName.value = ''
}

const cancelCreateAttribute = () => {
  isCreatingAttribute.value = false
  newAttributeName.value = ''
}

const confirmCreateAttribute = async () => {
  if (!newAttributeName.value.trim() || !props.groupData.id) return

  try {
    const newAttribute = await emit('create:attribute', newAttributeName.value.trim(), props.groupData.id)
    if (newAttribute) {
      currentAttribute.value = newAttribute
      emit('update:selected-attribute', newAttribute)
      isCreatingAttribute.value = false
    }
  } catch (error) {
    console.error('Ошибка создания атрибута:', error)
  }
}

const removeGroup = () => {
  emit('remove:group', props.groupData.id)
}

const initializeValues = () => {
  if (props.selectedAttribute && props.selectedAttribute.id) {
    currentAttribute.value = props.selectedAttribute
  } else {
    currentAttribute.value = defaultAttribute.value
  }

  if (props.groupData && props.groupData.id) {
    currentGroup.value = {
      id: props.groupData.id,
      name: props.groupData.name,
    }
  }
}

watch(() => props.selectedAttribute, initializeValues)
watch(() => props.groupData, initializeValues, { deep: true })

initializeValues()
</script>

<template>
  <div
    class="attribute-selector-product"
    :class="{
      'inherited-group': isInherited,
      'custom-group': isCustom,
      'required-group': groupData.require,
    }"
  >
    <!-- Заголовок группы -->
    <div class="group-header">
      <div class="group-title-section">
        <h4 class="group-title">
          <span v-if="isCustom && !groupData.id">Новая группа атрибутов</span>
          <span v-else>{{ groupData.name || 'Группа атрибутов' }}</span>

          <span v-if="isInherited" class="inherited-badge">Унаследована</span>
          <span v-if="groupData.require" class="required-badge">Обязательная</span>
          <span v-if="groupData.isNew" class="new-badge">Новая</span>
        </h4>

        <button v-if="isCustom" type="button" class="btn btn-danger btn-sm" @click="removeGroup">Удалить</button>
      </div>
    </div>

    <!-- Выбор группы (только для кастомных групп без выбранной группы) -->
    <div v-if="isCustom && (!groupData.id || groupData.isNew)" class="group-selection">
      <div class="form-group">
        <label class="form-label">Группа атрибутов</label>

        <div v-if="!isCreatingGroup && !isSelectingExistingGroup" class="selection-options">
          <div class="create-options">
            <button type="button" class="btn btn-primary btn-sm" @click="startSelectExistingGroup">
              Выбрать из существующих групп
            </button>
            <span class="option-divider">или</span>
            <button type="button" class="btn btn-secondary btn-sm" @click="startCreateGroup">
              Создать новую группу
            </button>
          </div>
        </div>

        <!-- Выбор существующей группы -->
        <div v-if="isSelectingExistingGroup" class="select-existing-group-form">
          <label class="form-label">Выберите группу из доступных</label>
          <SearchList
            :get-more-items="getAvailableGroupsForSearchList"
            :current-item="currentGroup"
            :default-item="defaultGroup"
            :search-placeholder="'Поиск доступных групп...'"
            :title-placeholder="'Выберите группу атрибутов'"
            :display-fields="['name']"
            @change-item="handleExistingGroupSelect"
          />
          <div class="form-actions">
            <button type="button" class="btn btn-secondary btn-sm" @click="cancelCreateGroup">Отмена</button>
          </div>
        </div>

        <!-- Создание новой группы -->
        <div v-if="isCreatingGroup" class="create-group-form">
          <label class="form-label">Создание новой группы</label>
          <input type="text" v-model="newGroupName" placeholder="Введите название группы" class="form-input" />
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-success btn-sm"
              @click="confirmCreateGroup"
              :disabled="!newGroupName.trim()"
            >
              Создать
            </button>
            <button type="button" class="btn btn-secondary btn-sm" @click="cancelCreateGroup">Отмена</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Выбор атрибута (когда группа выбрана) -->
    <div v-if="groupData.id" class="attribute-selection">
      <div class="form-group">
        <label class="form-label">Атрибут</label>

        <div v-if="!isCreatingAttribute" class="selection-options">
          <SearchList
            :get-more-items="getAttributesForSearchList"
            :current-item="currentAttribute"
            :default-item="defaultAttribute"
            :search-placeholder="'Поиск атрибутов...'"
            :title-placeholder="'Выберите атрибут'"
            :display-fields="['name']"
            :filter-fn="(attr) => attr.group_id === groupData.id"
            :disabled="isInherited"
            @change-item="handleAttributeSelect"
          />
          <div v-if="!isInherited" class="create-option">
            <span class="option-divider">или</span>
            <button type="button" class="btn btn-secondary btn-sm" @click="startCreateAttribute">
              Создать новый атрибут
            </button>
          </div>
        </div>

        <div v-else class="create-attribute-form">
          <input type="text" v-model="newAttributeName" placeholder="Введите название атрибута" class="form-input" />
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-success btn-sm"
              @click="confirmCreateAttribute"
              :disabled="!newAttributeName.trim()"
            >
              Создать
            </button>
            <button type="button" class="btn btn-secondary btn-sm" @click="cancelCreateAttribute">Отмена</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Сообщение об обязательности -->
    <div v-if="groupData.require && !currentAttribute.id" class="required-message">
      <span class="required-text">Это обязательный атрибут</span>
    </div>

    <!-- Сообщение для унаследованных групп -->
    <div v-if="isInherited && !groupData.id" class="inherited-message">
      <p>Эта группа атрибутов унаследована от родительской категории</p>
    </div>
  </div>
</template>

<style scoped>
.attribute-selector-product {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.inherited-group {
  background-color: #f9fafb;
  border-left: 4px solid #6b7280;
}

.custom-group {
  border-left: 4px solid #3b82f6;
}

.required-group {
  border-top: 2px solid #ef4444;
}

.group-header {
  margin-bottom: 16px;
}

.group-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.inherited-badge {
  background-color: #6b7280;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.required-badge {
  background-color: #ef4444;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.new-badge {
  background-color: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.selection-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.create-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-divider {
  color: #6b7280;
  font-size: 14px;
}

.create-group-form,
.create-attribute-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.current-attribute {
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #e0f2fe;
  border-radius: 4px;
  margin-top: 12px;
}

.attribute-name {
  font-weight: 500;
  color: #0369a1;
}

.required-message {
  margin-top: 8px;
}

.required-text {
  color: #ef4444;
  font-size: 14px;
  font-style: italic;
}

.inherited-message {
  background-color: #f3f4f6;
  padding: 12px;
  border-radius: 4px;
  margin-top: 12px;
}

.inherited-message p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  font-style: italic;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-success:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.create-options {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.option-divider {
  color: #6c757d;
  font-size: 0.9em;
}

.select-existing-group-form,
.create-group-form {
  margin-top: 10px;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
</style>

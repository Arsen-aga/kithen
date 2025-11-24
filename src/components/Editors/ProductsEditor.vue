<script setup>
import MediaSection from '@/components/Editors/MediaSection.vue'
import ActionButtons from '@/components/UI/ActionButtons.vue'
import SearchList from '@/components/UI/SearchList.vue'
import { useCategoriesLevel } from '@/helpers/useCategoriesLevel'
import { useAttributes } from '@/helpers/useAttributes'
import { ref, computed, watch } from 'vue'
import AttributeSelectorForProduct from './AttributeSelectorForProduct/AttributeSelectorForProduct.vue'

const props = defineProps({
  formData: Object,
  currentId: String,
})

const emit = defineEmits([
  'save',
  'remove-image',
  'remove-video',
  'update:selected-attributes',
  'update:images',
  'update:video',
])
const {
  searchAllRequiredGroupsInCategoryLevel,
  getGroupAttribute,
  getAllAttributes,
  getAllGroupsAttribute,
  createAttributeGroup,
  createAttribute,
} = useAttributes()
const { getAllCategories, getCategoryInId } = useCategoriesLevel()

const parentGroupsAttrConnections = ref([])
const parentGroupsAttrs = ref([])
const allAttributes = ref([])
const allGroups = ref([])
const customGroups = ref([])
const existingProductGroups = ref([])

const defaultCat = ref({
  id: null,
  Name: 'Без категории',
  level: null,
})
const currentCat = ref(defaultCat.value)

const availableGroups = computed(() => {
  const usedGroupIds = new Set()

  // Добавляем ID наследуемых групп
  parentGroupsAttrs.value.forEach((group) => {
    if (group.id) usedGroupIds.add(group.id)
  })

  // Добавляем ID кастомных групп
  customGroups.value.forEach((group) => {
    if (group.id && !group.isNew) usedGroupIds.add(group.id)
  })

  existingProductGroups.value.forEach((group) => {
    if (group.id) usedGroupIds.add(group.id)
  })

  // Фильтруем все группы, исключая использованные
  return allGroups.value.filter((group) => !usedGroupIds.has(group.id))
})

const allGroupsForDisplay = computed(() => {
  return [...parentGroupsAttrs.value, ...existingProductGroups.value, ...customGroups.value]
})

const handleAttributesUpdate = (updatedAttributes) => {
  emit('update:selected-attributes', updatedAttributes)
}
const getCategoriesForSearchList = async (params = {}) => {
  try {
    const { search = '', page = 1 } = params
    const categories = await getAllCategories(search, page)
    return Array.isArray(categories) ? categories : []
  } catch (error) {
    console.error('Ошибка загрузки групп атрибутов:', error)
    return []
  }
}
const updateCurrentCategory = async () => {
  if (!props.formData.Group) {
    currentCat.value = defaultCat.value
    return
  }

  try {
    const selectedCat = await getCategoryInId(props.formData.Group)
    currentCat.value = selectedCat || defaultCat.value
  } catch (error) {
    console.error('Ошибка загрузки категории:', error)
    currentCat.value = defaultCat.value
  }
}
const handleCategorySelect = (category) => {
  props.formData.Group = category.id
  currentCat.value = category
}

const getCurrentGroupsAttrs = async (connections) => {
  const groupAttrs = []
  try {
    for (const connection of connections) {
      const res = await getGroupAttribute(connection.attribute_group_id)
      groupAttrs.push({
        ...res,
        require: connection.require,
        isInherited: connection.parent_group || false,
        connectionData: connection,
      })
    }
    parentGroupsAttrs.value = groupAttrs
  } catch (error) {
    console.log(error)
  }
}

const loadAllData = async () => {
  try {
    allAttributes.value = await getAllAttributes()
    allGroups.value = await getAllGroupsAttribute()
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
}

const loadExistingProductGroups = async () => {
  if (!props.formData.attrs || !Array.isArray(props.formData.attrs) || props.formData.attrs.length === 0) {
    existingProductGroups.value = []
    return
  }

  try {
    const groupsMap = new Map()

    // Проходим по всем атрибутам товара
    for (const attr of props.formData.attrs) {
      if (attr.group_id && !groupsMap.has(attr.group_id)) {
        // Получаем информацию о группе
        const group = await getGroupAttribute(attr.group_id)
        if (group) {
          groupsMap.set(attr.group_id, {
            ...group,
            isInherited: false,
            isCustom: false,
            require: false,
            isExistingProductGroup: true, // Помечаем как группу из существующих атрибутов
          })
        }
      }
    }

    // Фильтруем группы, которые уже есть в наследуемых
    const inheritedGroupIds = new Set(parentGroupsAttrs.value.map((g) => g.id))
    existingProductGroups.value = Array.from(groupsMap.values()).filter((group) => !inheritedGroupIds.has(group.id))
  } catch (error) {
    console.error('Ошибка загрузки групп из существующих атрибутов:', error)
    existingProductGroups.value = []
  }
}

const getAttributeForGroup = (groupId) => {
  if (!props.formData.attrs || !Array.isArray(props.formData.attrs)) {
    return null
  }
  console.log('props.formData.attrs', props.formData.attrs)
  return props.formData.attrs.find((attr) => attr.group_id === groupId) || null
}

const handleAttributeUpdate = (groupId, attribute) => {
  const currentAttrs = [...(props.formData.attrs || [])]

  const filteredAttrs = currentAttrs.filter((attr) => attr.group_id !== groupId)

  if (attribute && attribute.id) {
    filteredAttrs.push(attribute)
  }

  handleAttributesUpdate(filteredAttrs)
}
const handleRemoveAttribute = (attributeId) => {
  const currentAttrs = [...(props.formData.attrs || [])]
  const filteredAttrs = currentAttrs.filter((attr) => attr.id !== attributeId)

  console.log('ProductsEditor: Удаление атрибута', attributeId)
  handleAttributesUpdate(filteredAttrs)
}

const handleRemoveExistingProductGroup = (groupId) => {
  // Удаляем группу из списка
  existingProductGroups.value = existingProductGroups.value.filter((group) => group.id !== groupId)

  // Удаляем все атрибуты этой группы из товара
  const currentAttrs = [...(props.formData.attrs || [])]
  const filteredAttrs = currentAttrs.filter((attr) => attr.group_id !== groupId)
  handleAttributesUpdate(filteredAttrs)
}

const addCustomGroup = async () => {
  const newGroup = {
    id: `${Date.now() + Math.random() * 100}`,
    name: 'Новая группа',
    isInherited: false,
    isCustom: true,
    isNew: true,
    require: false,
    availableGroups: availableGroups.value,
  }

  customGroups.value.push(newGroup)
}

const handleCreateGroup = async (groupName) => {
  try {
    const newGroup = await createAttributeGroup(groupName)

    const groupIndex = customGroups.value.findIndex((g) => g.isNew && !g.id)
    if (groupIndex !== -1) {
      customGroups.value[groupIndex] = {
        ...newGroup,
        isInherited: false,
        isCustom: true,
        require: false,
      }
    }

    allGroups.value = await getAllGroupsAttribute()

    return newGroup
  } catch (error) {
    console.error('Ошибка создания группы:', error)
    throw error
  }
}

const handleCreateAttribute = async (attributeName, groupId) => {
  try {
    const newAttribute = await createAttribute(attributeName, groupId)

    allAttributes.value = await getAllAttributes()

    return newAttribute
  } catch (error) {
    console.error('Ошибка создания атрибута:', error)
    throw error
  }
}

const handleRemoveCustomGroup = (groupId) => {
  customGroups.value = customGroups.value.filter((group) => group.id !== groupId)

  const currentAttrs = [...(props.formData.attrs || [])]
  const filteredAttrs = currentAttrs.filter((attr) => attr.group_id !== groupId)

  handleAttributesUpdate(filteredAttrs)
}

// Обработчик выбора существующей группы
const handleExistingGroupSelect = (groupId, customGroupId) => {
  const selectedGroup = allGroups.value.find((group) => group.id === groupId)
  if (!selectedGroup) return

  // Обновляем кастомную группу данными выбранной группы
  const groupIndex = customGroups.value.findIndex((group) => group.id === customGroupId)
  if (groupIndex !== -1) {
    customGroups.value[groupIndex] = {
      ...selectedGroup,
      isInherited: false,
      isCustom: true,
      require: false,
    }
  }
}

const initializeData = async () => {
  if (props.formData) {
    await updateCurrentCategory()
    await loadAllData()

    if (currentCat.value && currentCat.value.id) {
      parentGroupsAttrConnections.value = await searchAllRequiredGroupsInCategoryLevel(currentCat.value)
      await getCurrentGroupsAttrs(parentGroupsAttrConnections.value)
    }

    // После загрузки наследуемых групп загружаем группы из существующих атрибутов
    await loadExistingProductGroups()
  }
}

watch(() => props.formData, initializeData, { immediate: true, deep: true })
watch(
  async () => {
    if (props.formData) {
      await updateCurrentCategory()
      await loadAllData()

      if (currentCat.value && currentCat.value.id) {
        parentGroupsAttrConnections.value = await searchAllRequiredGroupsInCategoryLevel(currentCat.value)
        await getCurrentGroupsAttrs(parentGroupsAttrConnections.value)
      }
    }
  },
  { immediate: true }
)

watch(
  () => props.formData.attrs,
  async (newAttrs, oldAttrs) => {
    // Если изменились атрибуты, перезагружаем группы из существующих атрибутов
    if (JSON.stringify(newAttrs) !== JSON.stringify(oldAttrs)) {
      await loadExistingProductGroups()
    }
  },
  { deep: true }
)

watch(
  () => parentGroupsAttrs.value,
  async () => {
    await loadExistingProductGroups()
  },
  { deep: true }
)
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
          <SearchList
            :get-more-items="getCategoriesForSearchList"
            :current-item="currentCat"
            :default-item="defaultCat"
            :search-placeholder="'Поиск категории...'"
            :title-placeholder="'Выберите категорию'"
            :display-fields="['Name']"
            :item-style-fn="(item) => ({ paddingLeft: item?.level === 1 ? '30px' : item?.level === 2 ? '50px' : '' })"
            :display-fn="(item) => (item?.level !== 0 ? '--- ' : '') + (item?.Name || '')"
            @change-item="handleCategorySelect"
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
      <div class="section-header">
        <h3 class="section-title">Атрибуты товара</h3>
        <button
          type="button"
          class="btn btn-primary"
          @click="addCustomGroup"
          :disabled="availableGroups.length === 0 && customGroups.some((g) => g.isNew)"
        >
          + Добавить атрибут
        </button>
      </div>

      <div class="attributes-container">
        <!-- Наследуемые группы атрибутов -->
        <div v-if="parentGroupsAttrs.length > 0" class="inherited-groups">
          <h4 class="groups-subtitle">Наследуемые атрибуты</h4>
          <AttributeSelectorForProduct
            v-for="group in parentGroupsAttrs"
            :key="group.id"
            :group-data="group"
            :selected-attribute="getAttributeForGroup(group.id)"
            :all-groups="allGroups"
            :all-attributes="allAttributes"
            :is-inherited="true"
            @update:selected-attribute="handleAttributeUpdate(group.id, $event)"
          />
        </div>

        <!-- Группы из существующих атрибутов товара -->
        <div v-if="existingProductGroups.length > 0" class="existing-product-groups">
          <h4 class="groups-subtitle">Атрибуты товара</h4>
          <AttributeSelectorForProduct
            v-for="group in existingProductGroups"
            :key="group.id"
            :group-data="group"
            :selected-attribute="getAttributeForGroup(group.id)"
            :all-groups="allGroups"
            :all-attributes="allAttributes"
            :is-existing-product-group="true"
            @update:selected-attribute="handleAttributeUpdate(group.id, $event)"
            @remove:group="handleRemoveExistingProductGroup"
          />
        </div>

        <!-- Пользовательские группы атрибутов -->
        <div v-if="customGroups.length > 0" class="custom-groups">
          <h4 class="groups-subtitle">Дополнительные атрибуты</h4>
          <AttributeSelectorForProduct
            v-for="group in customGroups"
            :key="group.id"
            :group-data="group"
            :selected-attribute="getAttributeForGroup(group.id)"
            :all-groups="allGroups"
            :all-attributes="allAttributes"
            :available-groups="availableGroups"
            :is-custom="true"
            @update:selected-attribute="handleAttributeUpdate(group.id, $event)"
            @create:group="handleCreateGroup"
            @create:attribute="handleCreateAttribute"
            @remove:group="handleRemoveCustomGroup"
            @select:existing-group="handleExistingGroupSelect($event, group.id)"
          />
        </div>

        <!-- Сообщение если нет групп -->
        <div v-if="allGroupsForDisplay.length === 0" class="no-groups-message">
          <p>Нет доступных групп атрибутов. Добавьте атрибуты с помощью кнопки выше.</p>
        </div>

        <!-- Сообщение если все группы уже использованы -->
        <div v-if="availableGroups.length === 0 && customGroups.length > 0" class="no-available-groups-message">
          <p>Все доступные группы атрибутов уже добавлены к товару.</p>
        </div>
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
<style lang="scss" scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.existing-product-groups {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.groups-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.inherited-groups,
.custom-groups {
  margin-bottom: 24px;
}

.no-groups-message {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  font-style: italic;
  background-color: #f9fafb;
  border-radius: 8px;
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

.full-width {
  grid-column: 1 / -1;
}

.btn-primary {
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
  background: #dba250;
  color: white;
  &:hover {
    background: #fbaf45;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(246, 184, 59, 0.3);
  }
}
</style>

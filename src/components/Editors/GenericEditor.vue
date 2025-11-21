<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ActionButtons from '@/components/UI/ActionButtons.vue'
import DragDropImages from '@/components/UI/DragDropImages.vue'
import { useCategoriesLevel } from '@/helpers/useCategoriesLevel'

const { getAllCategories, getCategoryName } = useCategoriesLevel()
const props = defineProps({
  formData: Object,
  entityType: String,
  currentId: String,
  categoriesList: {
    type: Array,
    default: () => [],
  },
  groupsAttribute: {
    type: Array,
    default: () => [],
  },
  selectedAttributeGroups: {
    type: Array,
    default: () => [],
  },
})
const allCategories = ref([])
const isOpenList = ref(false)
const currentCat = ref(null)
const searchTimeout = ref(null)
const searchQuery = ref('')
const categoryWrapperRef = ref(null)

const selectedGroup = ref(null)
const showNewGroupForm = ref(false)
const newGroupName = ref('')
const newGroupRequire = ref(false)

const emit = defineEmits(['save', 'cancel', 'remove-image', 'update:images', 'change-parent-cat', 'change-level'])
const config = computed(() => {
  const configs = {
    'product-groups': {
      title: 'Категория товаров',
      label: 'Название категории',
      sort: 'Порядок категории',
      placeholder: 'Введите название категории товаров',
      hint: 'Например: Электроника, Одежда, Мебель и т.д.',
      entityType: 'категорию',
    },
    'product-attribute-groups': {
      title: 'Группа атрибутов',
      label: 'Название группы атрибутов',
      sort: '',
      placeholder: 'Введите название группы атрибутов',
      hint: 'Например: Цвет, Размер, Материал и т.д.',
      entityType: 'группу атрибутов',
    },
  }

  return (
    configs[props.entityType] || {
      title: 'Редактор',
      label: 'Название',
      placeholder: 'Введите название',
      hint: '',
      entityType: 'элемент',
    }
  )
})

const localImages = computed({
  get: () => {
    if (typeof props.formData.photo === 'string' && props.formData.photo) {
      return [
        {
          id: props.currentId === 'new' ? Date.now() : props.currentId,
          url: props.formData.photo,
          nameUrl: props.formData.photo.split('/').pop(),
          name: props.formData.photo.split('/').pop(),
          isExisting: true,
        },
      ]
    } else if (Array.isArray(props.formData.photo)) {
      return props.formData.photo
    } else {
      return []
    }
  },
  set: (value) => emit('update:images', value),
})

const handleSearch = async () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(async () => {
    // Если есть поисковый запрос, автоматически открываем список
    if (searchQuery.value) {
      isOpenList.value = true
    }
    // Загружаем категории с поисковым запросом
    allCategories.value = await getAllCategories(props.currentId, searchQuery.value)
  }, 500)
}
const handleClickOutside = (event) => {
  if (categoryWrapperRef.value && !categoryWrapperRef.value.contains(event.target)) {
    isOpenList.value = false
  }
}

const toggleList = () => {
  isOpenList.value = !isOpenList.value
  if (isOpenList.value && searchQuery.value) {
    handleSearch()
  }
}
const selectCat = (cat) => {
  console.log('cat', cat)
  currentCat.value = cat
  emit('change-parent-cat', cat.id)
  isOpenList.value = false
  searchQuery.value = ''
  if (cat.level !== 2) {
    emit('change-level', cat.level + 1)
  }
}

const updateCurrentCategory = async () => {
  if (props.formData.parent_id) {
    const categoryName = await getCategoryName(props.formData.parent_id)
    currentCat.value = {
      id: props.formData.parent_id,
      Name: categoryName,
    }
  } else {
    currentCat.value = {
      id: props.formData.parent_id,
      Name: 'Без родительской категории(корневая)',
    }
  }
}
watch(
  () => props.formData.parent_id,
  async (newParentId) => {
    console.log('parent_id changed:', newParentId)
    await updateCurrentCategory()
  }
)
watch(searchQuery, () => {
  handleSearch() // ← ДОБАВЛЕНО
})
onMounted(async () => {
  console.log('props.formData.parent_id', props.formData.parent_id)
  await updateCurrentCategory()
  allCategories.value = await getAllCategories(props.currentId)

  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<template>
  <div class="content-editor">
    <div class="editor-section">
      <h3 class="section-title">
        {{ config.title }} <span>ID: {{ currentId }}</span>
      </h3>
      <div
        :class="{
          'form-single': props.entityType !== 'product-groups',
          'form-grid': props.entityType === 'product-groups',
        }"
      >
        <div class="form-group">
          <label for="title" class="form-label">{{ config.label }}</label>
          <input type="text" id="title" v-model="formData.title" :placeholder="config.placeholder" class="form-input" />
          <div class="form-hint">{{ config.hint }}</div>
        </div>
        <div class="form-group" v-if="props.entityType === 'product-groups'">
          <label for="sort" class="form-label">{{ config.sort }}</label>
          <input type="number" id="sort" min="0" v-model="formData.sort" class="form-input" />
        </div>
        <div class="form-group grid-col-2" v-if="props.entityType === 'product-groups'">
          <p class="form-label">Родительская категория</p>
          <div class="category-wrapper" ref="categoryWrapperRef">
            <div class="category-title" :class="{ active: currentCat?.Name }" @click="toggleList">
              {{ currentCat?.Name }}
            </div>
            <div class="category-list" v-if="isOpenList">
              <div class="category-search">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Поиск категории..."
                  class="search-input"
                  @click.stop
                />
              </div>
              <p class="category-item" @click="selectCat(null)" :class="{ active: currentCat.id === cat.id }">
                Без родительской категории(корневая)
              </p>
              <p
                class="category-item"
                v-for="cat in allCategories"
                :key="cat.id"
                @click="selectCat(cat)"
                :class="{ active: currentCat.id === cat.id }"
                :style="{ marginLeft: cat.level === 1 ? '30px' : '' }"
              >
                {{ cat.level === 1 ? '--' : '' }} {{ cat.Name }}
              </p>
            </div>
          </div>
          <div class="form-hint">
            Выберите родительскую категорию для создания иерархии. Текущая категория и ее дочерние категории исключены
            из списка.
          </div>
        </div>
      </div>
    </div>

    <!-- Группы атрибутов для категорий -->
    <!-- <div v-if="entityType === 'product-groups'" class="editor-section">
      <h3 class="section-title">Группы атрибутов для категории</h3>
      <div class="attributes-container">
        <div class="form-group">
          <label class="form-label">Выберите существующую группу атрибутов</label>
          <div class="select-wrapper">
            <select v-model="selectedGroup" class="form-select">
              <option :value="null">Выберите группу атрибутов</option>
              <option v-for="group in groupsAttribute" :key="group.id" :value="group.id">
                {{ group.Name || group.name }}
              </option>
            </select>
          </div>
        </div>


        <div class="form-group button-group">
          <button type="button" class="btn btn-secondary" @click="addAttributeGroup" :disabled="!selectedGroup">
            Добавить выбранную группу
          </button>
          <span class="button-divider">или</span>
          <button type="button" class="btn btn-primary" @click="toggleNewGroupForm">
            {{ showNewGroupForm ? 'Отмена' : 'Создать новую группу' }}
          </button>
        </div>

      
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


        <div class="selected-groups" v-if="selectedAttributeGroups.length > 0">
          <h4 class="sub-section-title">Выбранные группы атрибутов:</h4>
          <div class="selected-groups-list">
            <div
              v-for="(group, index) in selectedAttributeGroups"
              :key="group.group_id"
              class="selected-group-item"
              :class="{ 'new-group': group.isNew }"
            >
              <div class="group-info">
                <span class="group-name">
                  {{ group.isNew ? group.name : getGroupName(group.group_id) }}
                  <span v-if="group.isNew" class="new-badge">новая</span>
                </span>
                <label class="checkbox-label" v-if="!group.inherited">
                  <input
                    type="checkbox"
                    :checked="group.require"
                    @change="updateGroupRequire(index, $event.target.checked)"
                  />
                  <span class="checkmark"></span>
                  Обязательная
                </label>
                <span v-else class="inherited-require">
                  {{ group.require ? 'Обязательная' : 'Необязательная' }} (наследование)
                </span>
              </div>
              <button
                type="button"
                class="btn btn-danger btn-sm"
                v-if="!group.inherited"
                @click="removeAttributeGroup(index)"
              >
                Удалить
              </button>
              <span v-else class="inherited-note">Унаследована</span>
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Изображение -->
    <div v-if="props.entityType === 'product-groups' && !formData.parent_id" class="editor-section">
      <h3 class="section-title">Изображение</h3>
      <div class="attributes-container">
        <div class="form-group">
          <DragDropImages
            v-model="localImages"
            :multiple="false"
            @update:images="(event) => emit('update:images', event)"
            @remove-image="(event) => emit('remove-image', event)"
          />
        </div>
      </div>
    </div>

    <ActionButtons
      :is-new="currentId === 'new'"
      :entity-type="entityType"
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

  &.new-group {
    background: #fff3cd;
    border-color: #ffeaa7;
  }
}

.group-info {
  display: flex;
  align-items: center;
  gap: 20px;
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
  background-color: #f8f9fa;
  border-left: 4px solid #6c757d;
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

.inherited-note {
  color: #6c757d;
  font-style: italic;
  font-size: 0.9em;
}

.grid-col-2 {
  grid-column: span 2;
}
.category-wrapper {
  position: relative;
}
.category-title {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;

  &.active {
    font-weight: 500;
  }
}
.category-list {
  position: absolute;
  bottom: 0;
  transform: translateY(100%);
  max-height: 400px;
  width: 100%;
  overflow-y: auto;
  display: grid;
  background-color: #464649;
  border-radius: 8px;
  padding: 16px;
  gap: 8px;
  z-index: 2;
}

.category-item {
  padding: 10px 15px;
  background-color: #fff;
  border-radius: 8px;
  cursor: pointer;
  &.active {
    background-color: #e2b87b;
    color: #fff;
  }
}

.category-search {
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.category-search .search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  height: 44px;
}

.category-search .search-input:focus {
  outline: none;
  border-color: #007bff;
}
</style>

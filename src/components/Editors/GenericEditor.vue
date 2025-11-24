<script setup>
import { computed, ref, watch } from 'vue'
import ActionButtons from '@/components/UI/ActionButtons.vue'
import DragDropImages from '@/components/UI/DragDropImages.vue'
import SearchList from '@/components/UI/SearchList.vue'
import AttrGroupToCategory from './AttrGroupToCat/AttrGroupToCategory.vue'
import { useCategoriesLevel } from '@/helpers/useCategoriesLevel'
import { useAttributes } from '@/helpers/useAttributes'

const { getAllCategories, getCategoryName } = useCategoriesLevel()
const { saveCategoryAttributeGroups } = useAttributes()

const props = defineProps({
  formData: Object,
  entityType: String,
  currentId: String,
})
const defaultCat = ref({
  id: null,
  Name: 'Без родительской категории(корневая)',
  level: null,
})
const currentCat = ref(defaultCat.value)
const attributeGroups = ref([])

const emit = defineEmits(['save', 'cancel', 'remove-image', 'update:images', 'change-parent-cat', 'change-level'])
const config = computed(() => {
  const configs = {
    'product-groups': {
      title: 'Категория товаров',
      label: 'Название категории',
      sort: 'Порядок категории',
      placeholder: 'Введите название категории товаров',
      hint: 'Например: Электроника, Одежда, Мебель и т.д.',
      entityType: 'группу',
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

const saveCat = async () => {
  try {
    // Сначала сохраняем основные данные категории
    emit('save')

    // Затем сохраняем группы атрибутов
    if (props.entityType === 'product-groups' && props.currentId && props.currentId !== 'new') {
      await saveCategoryAttributeGroups(props.currentId, attributeGroups.value)
      console.log('Группы атрибутов успешно сохранены')
    }
  } catch (error) {
    console.error('Ошибка сохранения категории:', error)
  }
}

const handleGroupsUpdate = (updatedGroups) => {
  attributeGroups.value = updatedGroups
}

const handleCategorySelect = (category) => {
  currentCat.value = category
  emit('change-parent-cat', category.id)
  if (category.level !== null && category.level < 2) {
    emit('change-level', category.level + 1)
  } else if (category.level == null) {
    emit('change-level', 0)
  }
}

const getCategoriesForSearchList = async (params = {}) => {
  try {
    const { search = '', page = 1 } = params
    const newCategories = await getAllCategories(search, page)
    return Array.isArray(newCategories) ? newCategories : []
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error)
    return []
  }
}

const filterCategories = (cat) => {
  return cat.level !== 2 && cat.parent_id !== Number(props.currentId) && cat.id !== Number(props.currentId)
}

const updateCurrentCategory = async () => {
  if (props.formData.parent_id) {
    const categoryName = await getCategoryName(props.formData.parent_id)
    currentCat.value = {
      id: props.formData.parent_id,
      Name: categoryName,
    }
  } else {
    currentCat.value = defaultCat.value
  }
}

watch(
  () => props.formData.parent_id,
  async () => {
    await updateCurrentCategory()
  }
)
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
          <SearchList
            :get-more-items="getCategoriesForSearchList"
            :current-item="currentCat"
            :default-item="defaultCat"
            :search-placeholder="'Поиск категории...'"
            :title-placeholder="'Выберите родительскую категорию'"
            :display-fields="['Name', 'name', 'title']"
            :item-style-fn="(item) => ({ paddingLeft: item?.level === 1 ? '30px' : '' })"
            :display-fn="(item) => (item?.level === 1 ? '--- ' : '') + (item?.Name || item?.name || '')"
            :filter-fn="(cat) => filterCategories(cat)"
            @change-item="handleCategorySelect"
          />
          <div class="form-hint">
            Выберите родительскую категорию для создания иерархии. Текущая категория и ее дочерние категории исключены
            из списка.
          </div>
        </div>
      </div>
    </div>

    <AttrGroupToCategory
      :entityType="entityType"
      :id="currentId"
      @update:groups="handleGroupsUpdate"
      :form-data="formData"
    />

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
    <ActionButtons :is-new="currentId === 'new'" :entity-type="entityType" @save="saveCat" @cancel="$emit('cancel')" />
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

.grid-col-2 {
  grid-column: span 2;
}
</style>

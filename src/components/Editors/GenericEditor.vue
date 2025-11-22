<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import ActionButtons from '@/components/UI/ActionButtons.vue'
import DragDropImages from '@/components/UI/DragDropImages.vue'
import { useCategoriesLevel } from '@/helpers/useCategoriesLevel'
import AttrGroupToCat from './AttrGroupToCat/AttrGroupToCat.vue'

const { getAllCategories, getCategoryName } = useCategoriesLevel()
const props = defineProps({
  formData: Object,
  entityType: String,
  currentId: String,
  groupsAttribute: {
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

const categoryListRef = ref(null)
const currentPage = ref(1)
const isLoading = ref(false)
const hasMore = ref(true)

const defaultCat = ref({
  id: null,
  Name: 'Без родительской категории(корневая)',
  level: null,
})

const emit = defineEmits(['save', 'cancel', 'remove-image', 'update:images', 'change-parent-cat', 'change-level'])
const config = computed(() => {
  const configs = {
    'product-groups': {
      title: 'Группа товаров',
      label: 'Название группы',
      sort: 'Порядок группы',
      placeholder: 'Введите название группы товаров',
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

const handleSearch = async () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(async () => {
    // Если есть поисковый запрос, автоматически открываем список
    currentPage.value = 1
    hasMore.value = true
    isLoading.value = true

    if (searchQuery.value) {
      isOpenList.value = true
    }
    // Загружаем категории с поисковым запросом
    allCategories.value = await getAllCategories(props.currentId, searchQuery.value)
    isLoading.value = false
  }, 500)
}

const handleScroll = () => {
  if (!categoryListRef.value || isLoading.value || !hasMore.value) return

  const { scrollTop, scrollHeight, clientHeight } = categoryListRef.value
  // Проверяем, достигли ли мы низа (с небольшим запасом в 10px)
  if (scrollHeight - scrollTop <= clientHeight + 10) {
    loadMoreCategories()
    console.log('first', 'test')
  }
}

const handleClickOutside = (event) => {
  if (categoryWrapperRef.value && !categoryWrapperRef.value.contains(event.target)) {
    isOpenList.value = false
  }
}

const loadMoreCategories = async () => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  currentPage.value++

  try {
    const moreCategories = await getAllCategories(props.currentId, searchQuery.value, currentPage.value)

    if (moreCategories && moreCategories.length > 0) {
      allCategories.value = [...allCategories.value, ...moreCategories]
      if (moreCategories.length < 10 || moreCategories.length === 0) {
        // Можете изменить на ожидаемое количество элементов на странице
        hasMore.value = false
      }
    } else {
      hasMore.value = false // Больше нет данных для загрузки
    }
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error)
    currentPage.value-- // Откатываем страницу при ошибке
  } finally {
    isLoading.value = false
  }
}

const toggleList = () => {
  isOpenList.value = !isOpenList.value
  if (isOpenList.value) {
    if (searchQuery.value) {
      currentPage.value = 1
      hasMore.value = true
      handleSearch()
    }
    nextTick(() => {
      if (categoryListRef.value) {
        categoryListRef.value.addEventListener('scroll', handleScroll)
      }
    })
  } else {
    if (categoryListRef.value) {
      categoryListRef.value.removeEventListener('scroll', handleScroll)
    }
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

  if (categoryListRef.value) {
    categoryListRef.value.removeEventListener('scroll', handleScroll)
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
  if (categoryListRef.value) {
    categoryListRef.value.removeEventListener('scroll', handleScroll)
  }
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
            <div class="category-list" v-if="isOpenList" ref="categoryListRef">
              <div class="category-search">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Поиск категории..."
                  class="search-input"
                  @click.stop
                />
              </div>
              <p
                class="category-item"
                @click="selectCat(defaultCat)"
                :class="{ active: currentCat.id === defaultCat.id }"
              >
                {{ defaultCat.Name }}
              </p>
              <p
                class="category-item"
                v-for="cat in allCategories"
                :key="cat.id"
                @click="selectCat(cat)"
                :class="{ active: currentCat.id === cat.id }"
                :style="{ paddingLeft: cat.level === 1 ? '30px' : '' }"
              >
                {{ cat.level === 1 ? '---' : '' }} {{ cat.Name }}
              </p>
              <div v-if="isLoading" class="loading-indicator">Загрузка...</div>
              <div v-if="!hasMore && allCategories.length > 0" class="end-of-list">Все категории загружены</div>
            </div>
          </div>
          <div class="form-hint">
            Выберите родительскую категорию для создания иерархии. Текущая категория и ее дочерние категории исключены
            из списка.
          </div>
        </div>
      </div>
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

    <AttrGroupToCat :entityType="entityType" :id="currentId" :groupsAttribute="groupsAttribute" />
    <!-- Изображение -->



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

.loading-indicator {
  padding: 10px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.end-of-list {
  padding: 10px;
  text-align: center;
  color: #999;
  font-size: 0.9em;
  border-top: 1px solid #eee;
}
</style>

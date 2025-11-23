<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import IconArrow from '@/components/icons/IconArrow.vue'

const props = defineProps({
  // Функция загрузки данных
  getMoreItems: {
    type: Function,
    required: true,
  },
  // Текущий выбранный элемент
  currentItem: {
    type: Object,
    required: true,
  },
  // Элемент по умолчанию
  defaultItem: {
    type: Object,
    required: true,
  },
  // Плейсхолдер для инпута
  searchPlaceholder: {
    type: String,
    default: 'Поиск...',
  },
  // Плейсхолдер для заголовка
  titlePlaceholder: {
    type: String,
    default: 'Выберите элемент',
  },
  // Поля для отображения названия
  displayFields: {
    type: Array,
    default: () => ['Name', 'name', 'title', 'label'],
  },
  // Ключ для идентификации элемента
  itemKey: {
    type: String,
    default: 'id',
  },
  // Функция для кастомного отображения элемента
  displayFn: {
    type: Function,
    default: null,
  },
  // Функция для кастомного стиля элемента
  itemStyleFn: {
    type: Function,
    default: null,
  },
  // Включить бесконечную прокрутку
  enableInfiniteScroll: {
    type: Boolean,
    default: true,
  },
  // Размер страницы для пагинации
  pageSize: {
    type: Number,
    default: 20,
  },
  filterFn: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['changeItem'])

// Реактивные данные
const isOpenList = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const hasMore = ref(true)
const listRef = ref(null)
const isLoading = ref(false)
const searchTimeout = ref(null)
const wrapperRef = ref(null)
const allItems = ref([])

// Утилиты
const getItemDisplay = (item) => {
  if (props.displayFn) return props.displayFn(item)

  for (const field of props.displayFields) {
    if (item[field] !== undefined) return item[field]
  }
  return String(item)
}

const getItemStyle = (item) => {
  if (props.itemStyleFn) return props.itemStyleFn(item)
  return {}
}

const isItemActive = (item) => {
  return item[props.itemKey] === props.currentItem[props.itemKey]
}

const applyFilter = (items) => {
  if (!props.filterFn || !Array.isArray(items)) {
    return items
  }

  try {
    return items.filter(props.filterFn)
  } catch (error) {
    console.error('Ошибка фильтрации элементов:', error)
    return items
  }
}

// Основные методы
const toggleList = () => {
  isOpenList.value = !isOpenList.value
  if (isOpenList.value && allItems.value.length === 0) {
    loadItems()
  }

  if (isOpenList.value && props.enableInfiniteScroll) {
    nextTick(() => {
      if (listRef.value) {
        listRef.value.addEventListener('scroll', handleScroll)
      }
    })
  } else {
    if (listRef.value) {
      listRef.value.removeEventListener('scroll', handleScroll)
    }
  }
}

const selectItem = (item) => {
  emit('changeItem', item)
  isOpenList.value = false
  searchQuery.value = ''
}

const handleScroll = () => {
  if (!props.enableInfiniteScroll || !listRef.value || isLoading.value || !hasMore.value) return

  const { scrollTop, scrollHeight, clientHeight } = listRef.value
  if (scrollHeight - scrollTop <= clientHeight + 25) {
    loadMoreItems()
  }
}

const handleSearch = async () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(async () => {
    currentPage.value = 1
    hasMore.value = true
    isLoading.value = true

    if (searchQuery.value) {
      isOpenList.value = true
    }

    try {
      const items = await props.getMoreItems({
        search: searchQuery.value,
        page: currentPage.value,
        pageSize: props.pageSize,
      })

      const filteredItems = applyFilter(items)
      allItems.value = filteredItems || []
      hasMore.value = items && items.length >= props.pageSize
    } catch (error) {
      console.error('Ошибка поиска:', error)
      allItems.value = []
    } finally {
      isLoading.value = false
    }
  }, 500)
}

const loadItems = async () => {
  isLoading.value = true
  try {
    const items = await props.getMoreItems({
      search: searchQuery.value,
      page: currentPage.value,
      pageSize: props.pageSize,
    })

    const filteredItems = applyFilter(items)
    allItems.value = filteredItems || []
    hasMore.value = items && items.length >= props.pageSize
  } catch (error) {
    console.error('Ошибка загрузки:', error)
    allItems.value = []
  } finally {
    isLoading.value = false
  }
}

const loadMoreItems = async () => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  currentPage.value++

  try {
    const moreItems = await props.getMoreItems({
      search: searchQuery.value,
      page: currentPage.value,
      pageSize: props.pageSize,
    })

    const filteredItems = applyFilter(moreItems)
    if (moreItems && moreItems.length > 0 && filteredItems) {
      allItems.value = [...allItems.value, ...filteredItems]
      hasMore.value = moreItems.length >= props.pageSize
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('Ошибка загрузки:', error)
    currentPage.value--
  } finally {
    isLoading.value = false
  }
}

const handleClickOutside = (event) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    isOpenList.value = false
  }
}

// Watchers
watch(searchQuery, handleSearch)

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (listRef.value) {
    listRef.value.removeEventListener('scroll', handleScroll)
  }
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<template>
  <div class="search-list-wrapper" ref="wrapperRef">
    <div class="search-list-title" :class="{ active: currentItem && currentItem[itemKey] }" @click="toggleList">
      {{ getItemDisplay(currentItem) || titlePlaceholder }}
      <IconArrow class="arrow" :class="{ 'rotate-arrow': isOpenList }" />
    </div>

    <div class="search-list-list" v-if="isOpenList" ref="listRef">
      <div class="search-list-search">
        <input
          type="text"
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          class="search-list-input"
          @click.stop
        />
      </div>
      <div
        class="search-list-item"
        @click="selectItem(defaultItem)"
        :class="{ active: isItemActive(defaultItem) }"
        :style="getItemStyle(defaultItem)"
      >
        {{ getItemDisplay(defaultItem) }}
      </div>

      <div
        class="search-list-item"
        v-for="item in allItems"
        :key="item[itemKey]"
        @click="selectItem(item)"
        :class="{ active: isItemActive(item) }"
        :style="getItemStyle(item)"
      >
        {{ getItemDisplay(item) }} (ID: {{ item.id }})
      </div>

      <div v-if="isLoading" class="search-list-loading">Загрузка...</div>
      <div v-if="!isLoading && allItems.length === 0 && searchQuery" class="search-list-end-list">
        Ничего не найдено
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-list-wrapper {
  position: relative;
  width: 100%;
}

.search-list-title {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
  min-height: 44px;
  display: flex;
  align-items: center;
  position: relative;

  &:hover {
    border-color: #d1d5db;
  }

  &.active {
    font-weight: 500;
  }
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) rotate(0deg);
  right: 10px;
  rotate: 0deg;
  transition: all 0.3s ease-in-out;

  &.rotate-arrow {
    transform: translateY(-50%) rotate(-90deg);
  }
}

.search-list-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 400px;
  overflow-y: auto;
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: grid;
  gap: 8px;
  z-index: 1000;
  margin-top: 4px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.search-list-item {
  padding: 10px 15px;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }

  &.active {
    background-color: #e2b87b;
    color: #fff;
    border-color: #e2b87b;
  }
}

.search-list-search {
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 8px;
}

.search-list-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  height: 40px;

  &:focus {
    outline: none;
    border-color: #e2b87b;
    box-shadow: 0 0 0 3px rgb(226, 184, 123, 0.1);
  }
}

.search-list-loading {
  padding: 16px;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.search-list-end-list {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875em;
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
}
</style>

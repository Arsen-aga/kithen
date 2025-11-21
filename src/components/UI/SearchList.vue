<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'

const emit = defineEmits(['changeItem'])
const isOpenList = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const hasMore = ref(true)
const categoryListRef = ref(null)
const isLoading = ref(false)
const searchTimeout = ref(null)
const allCategories = ref([])

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
  emit('changeItem', item)
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

watch(searchQuery, () => {
  handleSearch() // ← ДОБАВЛЕНО
})

onMounted(async () => {
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
  <div class="search-list-wrapper" ref="categoryWrapperRef">
    <div class="search-list-title" :class="{ active: currentCat?.Name }" @click="toggleList">
      {{ currentCat?.Name }}
    </div>
    <div class="search-list-list" v-if="isOpenList" ref="searchListRef">
      <div class="search-list-search">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Поиск категории..."
          class="search-list-input"
          @click.stop
        />
      </div>
      <p class="search-list-item" @click="selectCat(defaultCat)" :class="{ active: currentCat.id === defaultCat.id }">
        {{ defaultCat.Name }}
      </p>
      <p
        class="search-list-item"
        v-for="cat in allCategories"
        :key="cat.id"
        @click="selectCat(cat)"
        :class="{ active: currentCat.id === cat.id }"
        :style="{ paddingLeft: cat.level === 1 ? '30px' : '' }"
      >
        {{ cat.level === 1 ? '---' : '' }} {{ cat.Name }}
      </p>
      <div v-if="isLoading" class="search-list-loading">Загрузка...</div>
      <div v-if="!hasMore && allCategories.length > 0" class="search-list-end-list">Все категории загружены</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-list-wrapper {
  position: relative;
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

  &.active {
    font-weight: 500;
  }
}
.search-list-list {
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

.search-list-item {
  padding: 10px 15px;
  background-color: #fff;
  border-radius: 8px;
  cursor: pointer;
  &.active {
    background-color: #e2b87b;
    color: #fff;
  }
}

.search-list-search {
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.search-list-search .search-list-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  height: 44px;
}

.search-list-search .search-list-input:focus {
  outline: none;
  border-color: #007bff;
}

.search-list-loading {
  padding: 10px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.search-list-end-list {
  padding: 10px;
  text-align: center;
  color: #999;
  font-size: 0.9em;
  border-top: 1px solid #eee;
}
</style>

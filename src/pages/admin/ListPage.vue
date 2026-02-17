<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDefaultItems } from '@/stores/default'
import { toast } from 'vue3-toastify'
import { useApi } from '@/helpers/useApi'
import { useCategoriesLevel } from '@/helpers/useCategoriesLevel'

import SearchList from '@/components/UI/SearchList.vue'

const { getAllCategories, getCategoryInId } = useCategoriesLevel()
const { get, del } = useApi()

const route = useRoute()
const store = useDefaultItems()

// Получаем pathName из параметров роута
const pathName = computed(() => route.params.pathName)

const searchTimeout = ref(null)
const searchQuery = ref('')
const sortBy = ref('idAsc')
const categories = ref([])
const attributeGroups = ref([])

// Переменные для бесконечной ленты
const currentPage = ref(1)
const isLoading = ref(false)
const hasMore = ref(true)
const observer = ref(null)
const lastElement = ref(null)

// Новые переменные для фильтрации по категории
const selectedCategory = ref(null)
const defaultCategory = ref({
  id: null,
  Name: 'Все категории',
  level: null,
})
const showCategoryFilter = ref(false)


// Методы для бесконечной ленты
const loadMoreCategories = async () => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  currentPage.value++

  try {
    let url = `${pathName.value}?page=${currentPage.value}`
    if (searchQuery.value) {
      url += `&Name=${encodeURIComponent(searchQuery.value)}`
    }

    const response = await get(url)
    const newCategories = response

    if (newCategories && newCategories.length > 0) {
      const uniqueNewCategories = newCategories.filter(
        (newCat) => !categories.value.some((existingCat) => existingCat.id === newCat.id)
      )
      categories.value = [...categories.value, ...uniqueNewCategories]
      // Если пришло меньше 10 элементов (или другого ожидаемого количества), значит страницы кончились
      if (newCategories.length < 10 || uniqueNewCategories.length === 0) {
        // Можете изменить на ожидаемое количество элементов на странице
        hasMore.value = false
      }
    } else {
      hasMore.value = false
    }

    console.log(`Загружена страница ${currentPage.value}:`, newCategories)
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    hasMore.value = false
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  } finally {
    isLoading.value = false
  }
}

// Инициализация Intersection Observer
const initObserver = () => {
  if (observer.value) {
    observer.value.disconnect()
  }

  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoading.value && hasMore.value) {
        loadMoreCategories()
      }
    },
    {
      rootMargin: '100px', // Загружать заранее, когда до конца осталось 100px
      threshold: 0.1,
    }
  )

  if (lastElement.value) {
    observer.value.observe(lastElement.value)
  }
}

// Сброс состояния при смене страницы
const resetPagination = () => {
  currentPage.value = 1
  categories.value = []
  hasMore.value = true
  isLoading.value = false
}

// Фильтрация и сортировка категорий
const filteredCategories = computed(() => {
  let filtered = categories.value || []

  if (sortBy.value === 'idAsc') {
    return filtered.sort((a, b) => a.id - b.id)
  } else if (sortBy.value === 'idDesc') {
    return filtered.sort((a, b) => b.id - a.id)
  } else if (sortBy.value === 'nameAsc') {
    return filtered.sort((a, b) => {
      if (a.Name) {
        return a.Name.localeCompare(b.Name)
      } else if (a.username) {
        return a.username.localeCompare(b.username)
      } else {
        return a.name.localeCompare(b.name)
      }
    })
  } else if (sortBy.value === 'nameDesc') {
    return filtered.sort((a, b) => {
      if (b.Name) {
        return b.Name.localeCompare(a.Name)
      } else if (b.username) {
        return b.username.localeCompare(a.username)
      } else {
        return b.name.localeCompare(a.name)
      }
    })
  } else if (sortBy.value === 'groupIdAsc') {
    return filtered.sort((a, b) => a.group_id - b.group_id)
  } else if (sortBy.value === 'groupIdDesc') {
    return filtered.sort((a, b) => b.group_id - a.group_id)
  }
  return filtered
})

// Методы для фильтрации
const sortByF = (event, asc) => {
  let items = document.querySelectorAll('.filter-btn')
  items.forEach((item) => {
    item.classList.remove('active')
  })
  let item = event.target
  item.classList.add('active')
  sortBy.value = asc
}

// Удаление элемента
const deleteCategory = async (id) => {
  const link = `${pathName.value}/${id}`
  console.log(link)
  try {
    const response = await del(link)
    categories.value = categories.value.filter((category) => category.id !== id)
    console.log(response)
    toast.success('Элемент удален', { autoClose: 1000 })
  } catch (error) {
    console.error(error)
    toast.error('Ошибка при удалении', { autoClose: 1000 })
    await getContent()
  }
}


// Функция для получения категорий для SearchList
const getCategoriesForFilter = async (params = {}) => {
  try {
    const { search = '', page = 1 } = params
    const categories = await getAllCategories(search, page)
    return categories
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error)
    return []
  }
}

// Открытие фильтра по категориям
const openCategoryFilter = () => {
  showCategoryFilter.value = true
}

// Закрытие фильтра по категориям
const closeCategoryFilter = () => {
  showCategoryFilter.value = false
}

// Обработчик выбора категории для фильтрации
const handleCategoryFilter = async (category) => {
  selectedCategory.value = category.id ? category : null
  closeCategoryFilter()
  
  // Перезагружаем товары с новым фильтром
  await getContent()
}

// Сброс фильтра по категории
const clearCategoryFilter = () => {
  selectedCategory.value = null
  getContent()
}






// Загрузка данных (первая страница)
const getContent = async () => {
  resetPagination()

  try {
    let url = `${pathName.value}?page=${currentPage.value}`
    
    // Добавляем параметры фильтрации
    const params = new URLSearchParams()
    
    if (searchQuery.value) {
      params.append('Name', searchQuery.value)
    }
    
    // Добавляем фильтр по категории для товаров
    if (pathName.value === 'products' && selectedCategory.value?.id) {
      params.append('category_id', selectedCategory.value.id)
    }
    
    const queryString = params.toString()
    if (queryString) {
      url += `&${queryString}`
    }

    const response = await get(url)
    categories.value = response || []
    console.log('Загружены данные для:', pathName.value, categories.value)

    if (categories.value.length < 10) {
      hasMore.value = false
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  }
}

// Обработчик поиска с debounce
const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // Устанавливаем новый таймаут
  searchTimeout.value = setTimeout(() => {
    getContent()
  }, 500)
}

// Загрузка групп атрибутов (только для product-attributes)
const loadAttributeGroups = async () => {
  try {
    const response = await get(`product-attribute-groups`)
    attributeGroups.value = response || []
    console.log('Загруженные группы атрибутов:', attributeGroups.value)
  } catch (error) {
    console.error('Ошибка загрузки групп атрибутов:', error)
  }
}

// Получение названия группы атрибутов
const getGroupName = computed(() => {
  return (groupId) => {
    if (!groupId) return 'Без группы'
    const group = attributeGroups.value.find((g) => g.id === groupId)
    return group?.Name || group?.name || 'Неизвестная группа'
  }
})

// Получение заголовка страницы
const getPageTitle = () => {
  const titles = {
    products: 'Товары',
    'product-groups': 'Группы товаров',
    'product-attribute-groups': 'Группы атрибутов',
    'product-attributes': 'Атрибуты',
  }
  return titles[pathName.value] || 'Список'
}

// Проверка, является ли страница products (чтобы скрыть кнопку добавления)
const isProductsPage = computed(() => pathName.value === 'products')

// Инициализация
onMounted(async () => {
  await getContent()
  if (pathName.value === 'product-attributes') {
    await loadAttributeGroups()
  }

  // Инициализируем observer после загрузки DOM
  setTimeout(() => {
    initObserver()
  }, 100)
})

// Обновляем observer при изменении данных
watch(filteredCategories, () => {
  setTimeout(() => {
    initObserver()
  }, 100)
})

watch(searchQuery, () => {
  handleSearch() // ← ДОБАВЛЕНО
})

// Отслеживание изменения pathName
watch(pathName, async (newPathName) => {
  await getContent()
  if (newPathName === 'product-attributes') {
    await loadAttributeGroups()
  }
})

// Очистка observer при размонтировании
onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
  if (searchTimeout.value) {
    // ← ДОБАВЛЕНО
    clearTimeout(searchTimeout.value) // ← ДОБАВЛЕНО
  }
})
</script>

<template>
  <div class="categories-container">
    <!-- Заголовок и кнопка добавления -->
    <div class="categories-header">
      <h2 class="page-title">{{ getPageTitle() }}</h2>
      <!-- Фильтр по категориям для товаров -->
      <div v-if="isProductsPage" class="category-filter-wrapper">
        <div class="selected-category" @click="openCategoryFilter">
          <span class="category-label">Категория:</span>
          <span class="category-value">{{ selectedCategory?.Name || 'Все категории' }}</span>
          <span class="dropdown-arrow">▼</span>
        </div>
        <button 
          v-if="selectedCategory" 
          class="clear-filter-btn" 
          @click="clearCategoryFilter"
          title="Сбросить фильтр"
        >
          ×
        </button>
        <SearchList class="category-filter-wrapper__select" v-if="showCategoryFilter"
          :get-more-items="getCategoriesForFilter"
          :current-item="selectedCategory || defaultCategory"
          :default-item="defaultCategory"
          :search-placeholder="'Поиск категории...'"
          :title-placeholder="'Выберите категорию'"
          :display-fields="['Name']"
          :item-style-fn="(item) => ({ paddingLeft: item?.level === 1 ? '30px' : item?.level === 2 ? '50px' : '' })"
          :display-fn="(item) => (item?.level !== 0 ? '--- ' : '') + (item?.Name || '')"
          @change-item="handleCategoryFilter"
        />
      </div>
      <RouterLink :to="{ name: 'Edit', params: { name: pathName, id: 'new' } }" class="btn-primary">
        <span class="btn-icon">➕</span>
        Добавить
      </RouterLink>
    </div>

    <!-- Панель поиска и фильтров -->
    <div class="filters-panel">
      <div class="search-box">
        <div class="search-icon">🔍</div>
        <input v-model="searchQuery" type="text" placeholder="Поиск..." class="search-input" @input="handleSearch" />
      </div>

      <div class="filters-group">
        <!-- <button class="filter-btn" :class="{ active: sortBy === 'idAsc' }" @click="sortByF($event, 'idAsc')">
          <span>№ ↑</span>
        </button>
        <button class="filter-btn" :class="{ active: sortBy === 'idDesc' }" @click="sortByF($event, 'idDesc')">
          <span>№ ↓</span>
        </button> -->
        <button class="filter-btn" :class="{ active: sortBy === 'nameAsc' }" @click="sortByF($event, 'nameAsc')">
          <span>Имя A-Z</span>
        </button>
        <button class="filter-btn" :class="{ active: sortBy === 'nameDesc' }" @click="sortByF($event, 'nameDesc')">
          <span>Имя Z-A</span>
        </button>
        <button
          v-if="pathName === 'product-attributes'"
          class="filter-btn"
          :class="{ active: sortBy === 'groupIdAsc' }"
          @click="sortByF($event, 'groupIdAsc')"
        >
          <span>Группа ↑</span>
        </button>
        <button
          v-if="pathName === 'product-attributes'"
          class="filter-btn"
          :class="{ active: sortBy === 'groupIdDesc' }"
          @click="sortByF($event, 'groupIdDesc')"
        >
          <span>Группа ↓</span>
        </button>
      </div>
    </div>

    <!-- Таблица -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="column-id">ID</th>
            <!-- <th class="column-id">№</th> -->
            <th class="column-name">Название</th>
            <th v-if="pathName === 'product-attributes'" class="column-group">Группа</th>
            <th class="column-actions">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(category, index) in filteredCategories"
            :key="category.id"
            class="table-row"
            :ref="
              (el) => {
                if (index === filteredCategories.length - 1) lastElement = el
              }
            "
          >
            <td class="cell-id">{{ category.id }}</td>
            <!-- <td class="cell-id">{{ index + 1 }}</td> -->
            <td class="cell-name">
              <RouterLink :to="{ name: 'Edit', params: { name: pathName, id: category.id } }" class="name-link">
                <div class="name-content">
                  <span class="name-text"
                    >{{ category.level == 1 ? '---' : category.level == 2 ? '--- ---' : '' }}
                    {{ category?.Name || category?.name || category?.username }}</span
                  >
                  <span v-if="category.exists === 0" class="status-badge inactive">Неактивно</span>
                </div>
              </RouterLink>
            </td>
            <td v-if="pathName === 'product-attributes'" class="cell-group">
              <span class="group-badge">
                {{ getGroupName(category.group_id || category.attribute_group_id) }}
              </span>
            </td>
            <td class="cell-actions">
              <div class="actions-group">
                <RouterLink
                  :to="{ name: 'Edit', params: { name: pathName, id: category.id } }"
                  class="action-btn edit-btn"
                  title="Редактировать"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                    />
                  </svg>
                </RouterLink>
                <button
                  v-if="!isProductsPage"
                  class="action-btn delete-btn"
                  @click="deleteCategory(category.id)"
                  title="Удалить"
                  :class="{ disabled: category.exists === 0 }"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Индикатор загрузки -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <span>Загрузка...</span>
      </div>

      <!-- Сообщение о конце списка -->
      <div v-if="!hasMore && filteredCategories.length > 0" class="end-of-list">
        <span>Все элементы загружены</span>
      </div>

      <!-- Состояние пустой таблицы -->
      <div v-if="filteredCategories.length === 0 && !isLoading" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3 class="empty-title">Ничего не найдено</h3>
        <p class="empty-description">Попробуйте изменить параметры поиска или фильтрации</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.categories-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e5e9;
}

.categories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #dba250;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary:hover {
  background: #fbaf45;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(246, 184, 59, 0.3);
}

.btn-icon {
  font-size: 16px;
}

/* Панель фильтров */
.filters-panel {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #dba250;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filters-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: #dba250;
  color: #dba250;
}

.filter-btn.active {
  background: #dba250;
  border-color: #dba250;
  color: white;
}

/* Таблица */
.table-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.data-table th {
  background: #f8fafc;
  padding: 16px 20px 16px 30px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.column-id {
  width: 80px;
}

.column-name {
  width: auto;
}

.column-group {
  width: 200px;
}

.column-actions {
  width: 120px;
}

.table-row {
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.table-row:hover {
  background: #f9fafb;
}

.table-row:last-child {
  border-bottom: none;
}

.data-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #374151;
}

.cell-id {
  font-weight: 500;
  color: #6b7280;
}

.name-link {
  text-decoration: none;
  color: inherit;
  display: block;
  transition: color 0.2s ease;
}

.name-link:hover {
  color: #dba250;
}

.name-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-text {
  font-weight: 500;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.inactive {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.group-badge {
  background: #f8fafc;
  color: #f24343;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #f24343;
}

.cell-actions {
  text-align: right;
}

.actions-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.edit-btn {
  background: #f0f9ff;
  color: #0369a1;
}

.edit-btn:hover {
  background: #e0f2fe;
  transform: scale(1.05);
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover:not(.disabled) {
  background: #fee2e2;
  transform: scale(1.05);
}

.delete-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Индикатор загрузки */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #6b7280;
  font-size: 14px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #dba250;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Конец списка */
.end-of-list {
  text-align: center;
  padding: 20px;
  color: #6b7280;
  font-size: 14px;
  border-top: 1px solid #e5e7eb;
}

/* Состояние пустой таблицы */
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-description {
  font-size: 14px;
  margin: 0;
  opacity: 0.7;
}

.category-filter-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: auto;
  margin-left: 20px;
  position: relative;
}

.category-filter-wrapper__select{
  position: absolute;
  top: 0;
  transform: translateY(100%);
  z-index: 1;
  width: 300px;
}

.selected-category {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary, #f5f5f5);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.selected-category:hover {
  background: var(--bg-hover, #e8e8e8);
  border-color: var(--primary-color, #4a90e2);
}

.category-label {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
}

.category-value {
  font-weight: 500;
  color: var(--text-primary, #333);
}

.dropdown-arrow {
  font-size: 0.8rem;
  color: var(--text-secondary, #666);
  margin-left: 4px;
}

.clear-filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 6px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text-secondary, #666);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filter-btn:hover {
  background: var(--danger-color, #dc3545);
  color: white;
  border-color: var(--danger-color, #dc3545);
}
.category-filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  z-index: 1001;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #eee);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary, #333);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-secondary, #999);
  padding: 0 4px;
}

.close-btn:hover {
  color: var(--text-primary, #333);
}
</style>

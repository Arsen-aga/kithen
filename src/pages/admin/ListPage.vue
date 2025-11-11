<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDefaultItems } from '@/stores/default'
import axios from 'axios'
import { toast } from 'vue3-toastify'

const route = useRoute()
const store = useDefaultItems()

// Получаем pathName из параметров роута
const pathName = computed(() => route.params.pathName)

const searchQuery = ref('')
const sortBy = ref('idAsc')
const categories = ref([])
const user = ref(store.getUser)
const apiUrl = ref(store.getApiDomain)
const attributeGroups = ref([])

// Переменные для бесконечной ленты
const currentPage = ref(1)
const isLoading = ref(false)
const hasMore = ref(true)
const observer = ref(null)
const lastElement = ref(null)

// Методы для бесконечной ленты
const loadMoreCategories = async () => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  currentPage.value++

  const config = {
    headers: {
      Authorization: `Bearer ${user.value.bearer}`,
    },
  }

  try {
    const response = await axios.get(`${apiUrl.value}/${pathName.value}?page=${currentPage.value}`, config)
    const newCategories = response.data

    if (newCategories && newCategories.length > 0) {
      // Фильтруем дубликаты перед добавлением
      const uniqueNewCategories = newCategories.filter(
        (newCat) => !categories.value.some((existingCat) => existingCat.id === newCat.id)
      )

      categories.value = [...categories.value, ...uniqueNewCategories]

      // Если пришло меньше 10 элементов или все были дубликатами, значит страницы кончились
      if (newCategories.length < 10 || uniqueNewCategories.length === 0) {
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

// Функция для построения иерархической структуры категорий
const buildCategoryTree = (categoriesList) => {
  const categoryMap = new Map()
  const rootCategories = []

  // Сначала создаем карту всех категорий
  categoriesList.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] })
  })

  // Затем строим дерево
  categoriesList.forEach((category) => {
    const node = categoryMap.get(category.id)
    if (category.parent_id && categoryMap.has(category.parent_id)) {
      // Добавляем как дочернюю категорию
      categoryMap.get(category.parent_id).children.push(node)
    } else {
      // Это корневая категория
      rootCategories.push(node)
    }
  })

  return rootCategories
}

// Функция для преобразования дерева в плоский список с уровнями
const flattenCategoryTree = (tree, level = 0, result = []) => {
  tree.forEach((category) => {
    result.push({
      ...category,
      level: level,
      hasChildren: category.children && category.children.length > 0,
    })

    if (category.children && category.children.length > 0) {
      flattenCategoryTree(category.children, level + 1, result)
    }
  })
  return result
}

// Вычисляемое свойство для отображения категорий с учетом иерархии
const displayCategories = computed(() => {
  if (pathName.value !== 'external-categories') {
    return filteredCategories.value
  }

  // Для категорий строим иерархическую структуру
  const categoryTree = buildCategoryTree(filteredCategories.value)
  return flattenCategoryTree(categoryTree)
})

// Фильтрация и сортировка категорий
const filteredCategories = computed(() => {
  let filtered = []
  if (Array.isArray(categories.value)) {
    filtered = categories.value?.filter((category) => {
      if (category.Name) {
        return category.Name.toLowerCase().includes(searchQuery.value.toLowerCase())
      } else if (category.username) {
        return category.username.toLowerCase().includes(searchQuery.value.toLowerCase())
      } else if (category.name) {
        return category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      } else if (category.attribute_value) {
        return category.attribute_value.toLowerCase().includes(searchQuery.value.toLowerCase())
      } else {
        return category.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      }
    })
  }

  // Для категорий сортируем по sort_order, для остальных - как раньше
  if (pathName.value === 'external-categories') {
    return filtered.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  }

  if (sortBy.value === 'idAsc') {
    return filtered.sort((a, b) => a.id - b.id)
  } else if (sortBy.value === 'idDesc') {
    return filtered.sort((a, b) => b.id - a.id)
  } else if (sortBy.value === 'nameAsc') {
    return filtered.sort((a, b) => {
      console.log(a)
      if (a.Name) {
        return a.Name.localeCompare(b.Name)
      } else if (a.username) {
        return a.username.localeCompare(b.username)
      } else if (a.title) {
        return a.title.localeCompare(b.title)
      } else if (a.attribute_value) {
        return a.attribute_value.localeCompare(b.attribute_value)
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
      } else if (b.title) {
        return b.title.localeCompare(a.title)
      } else if (b.attribute_value) {
        return b.attribute_value.localeCompare(a.attribute_value)
      } else {
        return b.name.localeCompare(a.name)
      }
    })
  } else if (sortBy.value === 'groupIdAsc') {
    return filtered.sort((a, b) => a.group_id - b.group_id)
  } else if (sortBy.value === 'groupIdDesc') {
    return filtered.sort((a, b) => b.group_id - a.group_id)
  } else if (sortBy.value === 'uidAsc') {
    console.log(filtered)
    return filtered.sort((a, b) => a.uid.localeCompare(b.uid))
  } else if (sortBy.value === 'uidDesc') {
    console.log(filtered)
    return filtered.sort((a, b) => b.uid.localeCompare(a.uid))
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
  const config = {
    headers: {
      Authorization: `Bearer ${user.value.bearer}`,
    },
  }
  const link = `${store.getApiDomain}/${pathName.value}/${id}`
  console.log(link)
  try {
    const response = await axios.delete(link, config)
    categories.value = categories.value.filter((category) => category.id !== id)
    console.log(response.data)
    toast.success('Элемент удален', { autoClose: 1000 })
  } catch (error) {
    console.error(error)
    toast.error('Ошибка при удалении', { autoClose: 1000 })
    await getContent()
  }
}

// Загрузка данных (первая страница)
const getContent = async () => {
  resetPagination()

  const config = {
    headers: {
      Authorization: `Bearer ${user.value.bearer}`,
    },
  }
  try {
    const response = await axios.get(`${apiUrl.value}/${pathName.value}?page=${currentPage.value}`, config)
    categories.value = response.data || []
    console.log('Загружены данные для:', pathName.value, categories.value)

    // Проверяем, есть ли еще данные
    if (categories.value.length < 10) {
      // Если элементов меньше ожидаемого количества
      hasMore.value = false
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  }
}

// Загрузка групп атрибутов (только для product-attributes)
const loadAttributeGroups = async () => {
  const config = {
    headers: {
      Authorization: `Bearer ${user.value.bearer}`,
    },
  }
  try {
    const response = await axios.get(`${store.getApiDomain}/external-product-attribute-groups`, config)
    attributeGroups.value = response.data || []
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
    'external-products': 'Товары',
    'external-categories': 'Категория товаров',
    'external-product-attribute-groups': 'Группы атрибутов',
    'external-product-attributes': 'Атрибуты',
  }
  return titles[pathName.value] || 'Список'
}

// Проверка, является ли страница products (чтобы скрыть кнопку добавления)
const isProductsPage = computed(() => pathName.value === 'external-products')

// Инициализация
onMounted(async () => {
  await getContent()
  if (pathName.value === 'external-product-attributes') {
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

// Отслеживание изменения pathName
watch(pathName, async (newPathName) => {
  await getContent()
  if (newPathName === 'external-product-attributes') {
    await loadAttributeGroups()
  }
})

// Очистка observer при размонтировании
onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})

console.log(categories)
</script>

<template>
  <div class="categories-container">
    <!-- Заголовок и кнопка добавления -->
    <div class="categories-header">
      <h2 class="page-title">{{ getPageTitle() }}</h2>
      <RouterLink
        v-if="!isProductsPage"
        :to="{ name: 'Edit', params: { name: pathName, id: 'new' } }"
        class="btn-primary"
      >
        <span class="btn-icon">➕</span>
        Добавить
      </RouterLink>
    </div>

    <!-- Панель поиска и фильтров -->
    <div class="filters-panel">
      <div class="search-box">
        <div class="search-icon">🔍</div>
        <input v-model="searchQuery" type="text" placeholder="Поиск..." class="search-input" />
      </div>

      <div class="filters-group">
        <!-- <button class="filter-btn" :class="{ active: sortBy === 'idAsc' }" @click="sortByF($event, 'idAsc')">
          <span>ID ↑</span>
          <span>№ ↑</span>
        </button>
        <button class="filter-btn" :class="{ active: sortBy === 'idDesc' }" @click="sortByF($event, 'idDesc')">
          <span>ID ↓</span>
          <span>№ ↓</span>
        </button> -->
        <button class="filter-btn" :class="{ active: sortBy === 'nameAsc' }" @click="sortByF($event, 'nameAsc')">
          <span>Имя A-Z</span>
        </button>
        <button class="filter-btn" :class="{ active: sortBy === 'nameDesc' }" @click="sortByF($event, 'nameDesc')">
          <span>Имя Z-A</span>
        </button>
        <button
          v-if="pathName === 'external-product-attributes'"
          class="filter-btn"
          :class="{ active: sortBy === 'groupIdAsc' }"
          @click="sortByF($event, 'groupIdAsc')"
        >
          <span>Группа ↑</span>
        </button>
        <button
          v-if="pathName === 'external-product-attributes'"
          class="filter-btn"
          :class="{ active: sortBy === 'groupIdDesc' }"
          @click="sortByF($event, 'groupIdDesc')"
        >
          <span>Группа ↓</span>
        </button>
        <button
          v-if="pathName === 'external-products'"
          class="filter-btn"
          :class="{ active: sortBy === 'uidAsc' }"
          @click="sortByF($event, 'uidAsc')"
        >
          <span>ID ↑</span>
        </button>
        <button
          v-if="pathName === 'external-products'"
          class="filter-btn"
          :class="{ active: sortBy === 'uidDesc' }"
          @click="sortByF($event, 'uidDesc')"
        >
          <span>ID ↓</span>
        </button>
      </div>
    </div>

    <!-- Таблица -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <!-- <th class="column-id">ID</th> -->
            <!-- <th class="column-id">№</th> -->
            <th class="column-name">Название</th>
            <th v-if="pathName === 'external-product-attributes'" class="column-group">Группа</th>
            <th v-if="pathName === 'external-products'" class="column-uid">ID</th>
            <th class="column-actions">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(category, index) in displayCategories"
            :key="category.id"
            class="table-row"
            :style="{ paddingLeft: `${(category.level || 0) * 20}px` }"
            :ref="
              (el) => {
                if (index === displayCategories.length - 1) lastElement = el
              }
            "
          >
            <!-- <td class="cell-id">{{ category.id }}</td> -->
            <!-- <td class="cell-id">{{ index + 1 }}</td> -->
            <td class="cell-name">
              <RouterLink :to="{ name: 'Edit', params: { name: pathName, id: category.id } }" class="name-link">
                <div class="name-content">
                  <span class="name-text">
                    {{ category.level ? '---' : null }}
                    {{
                      category?.title ||
                      category?.name ||
                      category?.username ||
                      category?.Name ||
                      category?.attribute_value
                    }}</span
                  >
                  <span v-if="category.exists === 0" class="status-badge inactive">Неактивно</span>
                </div>
              </RouterLink>
            </td>
            <td v-if="pathName === 'external-product-attributes'" class="cell-group">
              <span class="group-badge">
                {{ getGroupName(category.group_id || category.attribute_group_id) }}
              </span>
            </td>
            <td v-if="pathName === 'external-products'" class="name-content">
              <span class="name-text">
                {{ category.uid }}
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
  padding: 16px 20px;
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
  padding: 16px 20px 16px 30px;
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
</style>

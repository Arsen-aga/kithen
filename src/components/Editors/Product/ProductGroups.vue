<script setup>
import { productToGroup } from '@/helpers/Connections/productToGroup'
import { useCategoriesLevel } from '@/helpers/useCategoriesLevel'
import { useProduct } from '@/stores/admin/Product'
import SearchList from '@/components/UI/SearchList.vue'
import { onMounted, ref, watch } from 'vue'

const { getAllCategories, getCategoryInId } = useCategoriesLevel()
const productStore = useProduct()
const { getAllConnectionsProductToGroup, createConnectionsProductToGroup, deleteConnectionsProductToGroup } =
  productToGroup()

const props = defineProps({
  productId: [String, Number],
  formData: Object,
})

const defaultCat = ref({
  id: null,
  Name: 'Без категории',
  level: null,
})

// Основная категория (из formData.Group)
const mainCategory = ref(defaultCat.value)

// Для добавления новых категорий
const currentCat = ref(defaultCat.value)
const showCategorySelector = ref(false)
const selectorMode = ref('main') // 'main' или 'additional'

// Все категории товара
const productCategories = ref([])

// Загружаем основную категорию
const loadMainCategory = async () => {
  if (props.formData?.Group) {
    try {
      const category = await getCategoryInId(props.formData.Group)
      mainCategory.value = category || defaultCat.value
    } catch (error) {
      console.error('Ошибка загрузки основной категории:', error)
      mainCategory.value = defaultCat.value
    }
  } else {
    mainCategory.value = defaultCat.value
  }
}

// Загружаем все категории товара
const loadAllCategories = async () => {
  if (!props.productId) return

  try {
    // Загружаем основную категорию
    await loadMainCategory()

    // Загружаем дополнительные категории из связей
    const connections = await getAllConnectionsProductToGroup(props.productId)

    const additionalCategories = []
    if (connections && connections.length > 0) {
      for (const connection of connections) {
        const category = await getCategoryInId(connection.group_id)
        if (category && category.id !== props.formData?.Group) {
          additionalCategories.push({
            ...category,
            connectionId: connection.id,
          })
        }
      }
    }

    productCategories.value = additionalCategories

    // Обновляем стор
    const allCategories = mainCategory.value.id ? [mainCategory.value, ...additionalCategories] : additionalCategories
    productStore.setProduct({
      id: props.productId,
      categories: allCategories,
    })
  } catch (error) {
    console.error('Ошибка загрузки категорий товара:', error)
  }
}

// Функция для SearchList
const getCategoriesForSearchList = async (params = {}) => {
  try {
    const { search = '', page = 1 } = params
    const categories = await getAllCategories(search, page)

    // Фильтруем уже добавленные категории
    const addedCategoryIds = new Set()
    if (mainCategory.value.id) addedCategoryIds.add(mainCategory.value.id)
    productCategories.value.forEach((cat) => addedCategoryIds.add(cat.id))

    return categories.filter((cat) => !addedCategoryIds.has(cat.id))
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error)
    return []
  }
}

// Открытие селектора для выбора категории
const openCategorySelector = (mode) => {
  selectorMode.value = mode
  showCategorySelector.value = true
  currentCat.value = mode === 'main' ? mainCategory.value : defaultCat.value
}

// Закрытие селектора
const closeCategorySelector = () => {
  showCategorySelector.value = false
}

// Обработчик выбора категории
const handleCategorySelect = async (category) => {
  if (!category.id) return

  if (selectorMode.value === 'main') {
    // Устанавливаем основную категорию
    mainCategory.value = category
    props.formData.Group = category.id
  } else {
    // Добавляем дополнительную категорию
    if (props.productId) {
      try {
        const connection = await createConnectionsProductToGroup(props.productId, category.id)

        productCategories.value.push({
          ...category,
          connectionId: connection.id || Date.now(),
        })
      } catch (error) {
        console.error('Ошибка добавления категории:', error)
        return
      }
    }
  }

  // Обновляем стор
  const allCategories = mainCategory.value.id
    ? [mainCategory.value, ...productCategories.value]
    : productCategories.value
  productStore.setProduct({
    id: props.productId,
    categories: allCategories,
  })

  closeCategorySelector()
}

// Удаление категории
const handleRemoveCategory = async (category) => {
  if (category.isMain) {
    // Удаляем основную категорию
    mainCategory.value = defaultCat.value
    props.formData.Group = null
  } else {
    // Удаляем дополнительную категорию
    if (category.connectionId && props.productId) {
      try {
        await deleteConnectionsProductToGroup(category.connectionId)
      } catch (error) {
        console.error('Ошибка удаления связи:', error)
      }
    }
    productCategories.value = productCategories.value.filter((cat) => cat.id !== category.id)
  }

  // Обновляем стор
  const allCategories = mainCategory.value.id
    ? [mainCategory.value, ...productCategories.value]
    : productCategories.value
  productStore.setProduct({
    id: props.productId,
    categories: allCategories,
  })
}

// Все категории для отображения (с флагом isMain)
const displayCategories = () => {
  const categories = []

  // Основная категория
  if (mainCategory.value.id) {
    categories.push({
      ...mainCategory.value,
      isMain: true,
      connectionId: null,
    })
  }
  
  // Дополнительные категории
  categories.push(
    ...productCategories.value.map((cat) => ({
      ...cat,
      isMain: false,
    }))
  )

  return categories
}

// Инициализация
onMounted(() => {
  loadAllCategories()
})

// Наблюдатели
watch(
  () => props.productId,
  (newId) => {
    if (newId) {
      loadAllCategories()
    }
  },
  { immediate: true }
)

watch(
  () => props.formData?.Group,
  () => {
    loadAllCategories()
  },
  { immediate: true }
)
</script>

<template>
  <div class="product-groups">
    <!-- Список категорий -->
    <div class="categories-list" v-if="displayCategories().length > 0">
      <div
        class="category-badge"
        :class="{ main: category.isMain }"
        v-for="category in displayCategories()"
        :key="category.id"
      >
        <span class="category-name">{{ category.Name }}</span>
        <span class="badge-label" v-if="category.isMain">Основная</span>
        <button
          class="remove-btn"
          @click="handleRemoveCategory(category)"
          :title="category.isMain ? 'Удалить основную категорию' : 'Удалить категорию'"
        >
          ×
        </button>
      </div>
    </div>
    <div class="actions">
      <button class="btn btn-main" @click="openCategorySelector('main')">
        {{ mainCategory.id ? 'Изменить основную' : '+ Основная' }}
      </button>
      <button class="btn btn-add" @click="openCategorySelector('additional')" :disabled="!mainCategory.id">
        + Добавить
      </button>
    </div>

    <!-- Селектор категорий (один для всех случаев) -->
    <div v-if="showCategorySelector" class="category-selector">
      <div class="selector-header">
        <h4>{{ selectorMode === 'main' ? 'Выбор основной категории' : 'Добавление категории' }}</h4>
        <button class="close-btn" @click="closeCategorySelector">×</button>
      </div>
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
  </div>
</template>

<style lang="scss" scoped>
.actions {
  display: flex;
  gap: 8px;

  .btn {
    padding: 6px 12px;
    border: 1px solid;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &.btn-main {
      background-color: #e8f5e8;
      border-color: #c8e6c9;
      color: #2e7d32;

      &:hover {
        background-color: #d4edda;
      }
    }

    &.btn-add {
      background-color: #e3f2fd;
      border-color: #bbdefb;
      color: #1976d2;

      &:hover:not(:disabled) {
        background-color: #d1e9ff;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: #f5f5f5;
        border-color: #ddd;
        color: #999;
      }
    }
  }
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;

  // Дополнительные категории
  background-color: #e3f2fd;
  border: 1px solid #bbdefb;
  color: #1976d2;

  // Основная категория
  &.main {
    background-color: #e8f5e8;
    border: 1px solid #c8e6c9;
    color: #2e7d32;
    order: -1; // Основная всегда первая
  }

  .category-name {
    font-weight: 500;
  }

  .badge-label {
    font-size: 11px;
    padding: 2px 6px;
    background-color: currentColor;
    color: white;
    border-radius: 10px;
    font-weight: 500;

    .main & {
      background-color: #4caf50;
    }

    &:not(.main) {
      background-color: #1976d2;
    }
  }

  .remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    color: white;
    background-color: currentColor;

    .main & {
      background-color: #f44336;

      &:hover {
        background-color: #d32f2f;
      }
    }

    &:not(.main) {
      background-color: #1976d2;

      &:hover {
        background-color: #0d47a1;
      }
    }
  }
}

.empty-message {
  padding: 10px;
  color: #757575;
  font-style: italic;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 15px;
}

.category-selector {
  margin-top: 15px;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    h4 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      color: #666;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #333;
      }
    }
  }
}
</style>

<!-- CatalogBlock.vue -->
<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import MainButton from '@/components/UI/MainButton.vue'
import CatalogFilter from '@/components/CatalogFilter.vue'
import CatalogProduct from '@/components/CatalogProduct.vue'
import MainPagination from '@/components/UI/MainPagination.vue'
import { useApi } from '@/helpers/useApi'
import { toast } from 'vue3-toastify'
import { useCatalogBlock } from '@/stores/catalogBlock'
import SearchInput from '@/components/UI/SearchInput.vue'

const storeCatalog = useCatalogBlock()
const { get } = useApi()

const props = defineProps({
  groupId: [Number, String],
})

const products = ref([])
const searchQuery = ref('')
const searchTimeout = ref(null)

// Параметры пагинации
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const perPage = ref(10) // Количество товаров на странице
const isLoading = ref(false)

// Значения минимальной и максимальной цены для фильтрации
const priceRange = computed(() => {
  if (!products.value.length) {
    return { min: 0, max: 3130000 }
  }

  const prices = products.value
    .map((p) => Math.round(Number(p.Price)))
    .filter((price) => price != null)

  if (!prices.length) {
    return { min: 0, max: 3130000 }
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
})

const minPrice = ref(priceRange.value.min)
const maxPrice = ref(priceRange.value.max)

const filteredProducts = computed(() => {
  return products.value.filter(
    (product) => product.Price >= minPrice.value && product.Price <= maxPrice.value
  )
})

// Загрузка товаров с пагинацией
const getProducts = async (page = currentPage.value) => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    let url = `products?Group=${props.groupId}`
    const params = new URLSearchParams()

    if (searchQuery.value) {
      params.append('Name', searchQuery.value)
    }

    // Добавляем параметры пагинации
    params.append('page', page)
    params.append('limit', perPage.value)

    if (params.toString()) {
      url += `&${params.toString()}`
    }

    const response = await get(url, true) // true для получения полного ответа с заголовками

    // Получаем заголовки пагинации из ответа
    const paginationHeaders = {
      currentPage: response.headers['x-pagination-current-page'],
      pageCount: response.headers['x-pagination-page-count'],
      perPage: response.headers['x-pagination-per-page'],
      totalCount: response.headers['x-pagination-total-count'],
    }

    // Обновляем состояние пагинации
    currentPage.value = Number(paginationHeaders.currentPage) || page
    totalPages.value = Number(paginationHeaders.pageCount) || 1
    totalCount.value = Number(paginationHeaders.totalCount) || 0
    perPage.value = Number(paginationHeaders.perPage) || 10

    // Получаем массив товаров из ответа
    products.value = response.data || response

    // if (products.value.length === 0) {
    //   toast.error('В данной категории нет товаров', { autoClose: 1000 })
    // }

    // Обновляем диапазон цен
    minPrice.value = priceRange.value.min
    maxPrice.value = priceRange.value.max

    // Прокручиваем контейнер вверх при смене страницы
    const container = document.querySelector('.catalog-block__inner')
    if (container) {
      container.scrollTop = 0
    }

  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    products.value = []
    totalPages.value = 0
    totalCount.value = 0
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  } finally {
    isLoading.value = false
  }
}

// Обработчик смены страницы
const handlePageChange = (page) => {
  getProducts(page)
}

// Сброс пагинации и загрузка первой страницы
const resetAndLoadFirstPage = () => {
  currentPage.value = 1
  getProducts(1)
}

const closeCatalog = () => storeCatalog.closeCatalog()

// Следим за изменением группы
watch(
  () => props.groupId,
  async () => {
    await resetAndLoadFirstPage()
  },
  { immediate: true }
)

// Следим за поисковым запросом с debounce
watch(
  () => searchQuery.value,
  () => {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = setTimeout(() => {
      resetAndLoadFirstPage() // Сбрасываем на первую страницу при поиске
    }, 500)
  }
)

// Следим за изменением цен для фильтрации
watch(priceRange, (newRange) => {
  minPrice.value = newRange.min
  maxPrice.value = newRange.max
})

// Очищаем таймаут при размонтировании
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<template>
  <div class="catalog-block">
    <div class="catalog-block__top">
      <MainButton class="catalog-block__btn" :show-arrows="true" @click="closeCatalog">
        Вернуться
      </MainButton>
      <SearchInput 
        class="catalog-block__search" 
        placeholder="Поиск..." 
        v-model="searchQuery" 
      />
    </div>

    <div class="catalog-block__inner">
      <div class="catalog-block__content">
        <CatalogFilter
          class="catalog-block__filter"
          :group-id="groupId"
          :min-price="minPrice"
          :max-price="maxPrice"
          @update:min-price="(val) => (minPrice = val)"
          @update:max-price="(val) => (maxPrice = val)"
        />

        <div class="catalog-block__items">
          <!-- Товары -->
          <CatalogProduct
            class="catalog-block__item"
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />

          <!-- Индикатор загрузки -->
          <div v-if="isLoading" class="loading-indicator">
            <div class="spinner"></div>
            <span>Загрузка...</span>
          </div>

          <!-- Сообщение, если товаров нет -->
          <div v-if="!isLoading && filteredProducts.length === 0" class="no-products">
            Товары не найдены
          </div>
        </div>
      </div>
    </div>

    <!-- Пагинация -->
    <div class="catalog-block__pagination">
      <MainPagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-count="totalCount"
        :per-page="perPage"
        :show-info="true"
        @page-change="handlePageChange"
        @update:currentPage="handlePageChange"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.catalog-block {
  padding: 15px 0;

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  }
  &__btn {
    padding: 16px 20px 14px;
  }
  
  &__search {
    max-width: 220px;
  }

  &__inner {
    padding: 20px 0;
    max-height: 1200px;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    flex: 1;
  }

  &__content {
    display: grid;
    grid-template-columns: minmax(0, 224px) minmax(0, 1fr);
  }

  &__filter {
    position: sticky;
    box-shadow: 0px -2px 2px -2px rgb(163, 169, 183);
    top: 0;
    z-index: 10;
  }
  &__items {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    position: relative;
  }

  &__pagination {
    margin-top: 20px;
    flex-shrink: 0;
  }
}

/* Индикатор загрузки */
.loading-indicator {
  grid-column: span 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
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

.no-products {
  grid-column: span 3;
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import MainButton from '@/components/UI/MainButton.vue'
// import IconSearch from '@/components/icons/IconSearch.vue'
import CatalogFilter from '@/components/CatalogFilter.vue'
import CatalogProduct from '@/components/CatalogProduct.vue'
import { useApi } from '@/helpers/useApi'
import { toast } from 'vue3-toastify'
import { useCatalogBlock } from '@/stores/catalogBlock'
import SearchInput from '@/components/UI/SearchInput.vue'

const storeCatalog = useCatalogBlock()
const { get } = useApi()

const props = defineProps({
  groupId: [Number || String],
})

const products = ref([])
const searchQuery = ref('')
const searchTimeout = ref(null)

// Переменные для бесконечной ленты
const currentPage = ref(1)
const isLoading = ref(false)
const hasMore = ref(true)
const scrollContainer = ref(null)

const handleScroll = () => {
  if (!scrollContainer.value || isLoading.value || !hasMore.value) return

  const container = scrollContainer.value
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight

  // Срабатывает, когда пользователь прокрутил до конца -100px
  if (scrollHeight - scrollTop <= clientHeight + 100) {
    loadMoreProducts()
  }
}
const initScrollListener = () => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll)
  }
}
const cleanupScrollListener = () => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
}

// Методы для бесконечной ленты
const loadMoreProducts = async () => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  currentPage.value += 1

  try {
    let url = `products?Group=${props.groupId}&page=${currentPage.value}`
    if (searchQuery.value) {
      url += `&Name=${encodeURIComponent(searchQuery.value)}`
    }

    const response = await get(url)
    const newProducts = response

    if (newProducts && newProducts.length > 0) {
      products.value = [...products.value, ...newProducts]
      if (newProducts.length < 10) {
        hasMore.value = false
      }
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    hasMore.value = false
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  } finally {
    isLoading.value = false
  }
}

const resetPagination = () => {
  currentPage.value = 1
  products.value = []
  hasMore.value = true
  isLoading.value = false
}

// Значения минимальной и максимальной цены для фильтрации, по умолчанию с диапазоном от минимальной до максимальной цены в товарах
const priceRange = computed(() => {
  if (!products.value.length) {
    return { min: 0, max: 3130000 }
  }

  const prices = products.value.map((p) => Math.round(Number(p.Price))).filter((price) => price != null)

  if (!prices.length) {
    return { min: 0, max: 3130000 }
  }

  const returnObj = {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
  return returnObj
})

const minPrice = ref(priceRange.value.min)
const maxPrice = ref(priceRange.value.max)

const filteredProducts = computed(() => {
  return products.value.filter((product) => product.Price >= minPrice.value && product.Price <= maxPrice.value)
})

const getProducts = async (groupId) => {
  resetPagination()
  cleanupScrollListener()
  try {
    let url = `products?Group=${groupId}`
    if (searchQuery.value) {
      url += `&Name=${encodeURIComponent(searchQuery.value)}`
    }
    const response = await get(url)
    if (response.length === 0) {
      toast.error('В данной категории нет товаров', { autoClose: 1000 })
      throw new Error('В данной категории нет товаров')
    }
    products.value = response
    minPrice.value = priceRange.value.min
    maxPrice.value = priceRange.value.max
  } catch (error) {
    console.error(error)
  }
}

const closeCatalog = () => storeCatalog.closeCatalog()
watch(priceRange, (newRange) => {
  minPrice.value = newRange.min
  maxPrice.value = newRange.max
})
watch(
  () => props.groupId,
  async () => {
    await getProducts(props.groupId)
    setTimeout(() => {
      initScrollListener()
    }, 100)
  }
)
watch(
  () => searchQuery.value,
  () => {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = setTimeout(() => {
      getProducts(props.groupId)
    }, 500)
  }
)

onMounted(() => {
  // Инициализируем слушатель скролла после монтирования
  setTimeout(() => {
    initScrollListener()
  }, 100)
})
onUnmounted(() => {
  cleanupScrollListener()
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<template>
  <div class="catalog-block">
    <div class="catalog-block__top">
      <MainButton class="catalog-block__btn" :show-arrows="true" @click="closeCatalog">Вернуться</MainButton>
      <SearchInput class="catalog-block__search" placeholder="Поиск..." v-model="searchQuery" />
    </div>
    <div class="catalog-block__inner" ref="scrollContainer" @scroll.passive="handleScroll">
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
          <CatalogProduct
            class="catalog-block__item"
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />
          <div v-if="isLoading" class="loading-indicator">
            <div class="spinner"></div>
            <span>Загрузка...</span>
          </div>
        </div>
      </div>
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
  &__search{
    max-width: 220px;
  }

  &__inner {
    padding: 20px 0;
    max-height: 1320px;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    padding-left: 1px;
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
    height: fit-content;
  }
}

/* Индикатор загрузки */
.loading-indicator {
  grid-column: span 3;
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
</style>

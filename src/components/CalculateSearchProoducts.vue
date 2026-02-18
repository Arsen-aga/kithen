<!-- Ваш обновленный компонент -->
<script setup>
import { ref, watch } from 'vue'
import { useApi } from '@/helpers/useApi'
import { toast } from 'vue3-toastify'
import SearchInput from '@/components/UI/SearchInput.vue'
import CatalogProduct from '@/components/CatalogProduct.vue'
import MainPagination from '@/components/UI/MainPagination.vue' // Импортируем новый компонент

const { get } = useApi()
defineProps({
  showProducts: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:showProducts'])

const products = ref([])
const searchQuery = ref('')
const searchTimeout = ref(null)

// Параметры пагинации
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const perPage = ref(20)

const getProducts = async (page = currentPage.value) => {
  try {
    let url = `products`
    const params = new URLSearchParams()

    if (searchQuery.value) {
      params.append('Name', searchQuery.value)
    }

    params.append('page', page)
    params.append('limit', perPage.value)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await get(url, true)

    // Получаем заголовки пагинации
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
    perPage.value = Number(paginationHeaders.perPage) || 20

    products.value = response.data || response

    if (products.value.length === 0) {
      toast.error('Товары не найдены', { autoClose: 1000 })
      emit('update:showProducts', true)
    }
  } catch (error) {
    console.error(error)
    products.value = []
    totalPages.value = 0
    totalCount.value = 0
  }
}

// Обработчик изменения страницы
const handlePageChange = (page) => {
  getProducts(page)
}

watch(
  () => searchQuery.value,
  () => {
    clearTimeout(searchTimeout.value)
    currentPage.value = 1
    if (searchQuery.value.length > 0) {
      searchTimeout.value = setTimeout(() => {
        getProducts(1)        
      }, 500)
    } else {
      products.value = []
      totalPages.value = 0
      totalCount.value = 0
      emit('update:showProducts', false)
    }
  }
)

watch(() => products.value, (newProducts) => {
  if (newProducts.length > 0) {
    emit('update:showProducts', true)
  }
}, { deep: true })
</script>

<template>
  <div>
    <SearchInput class="calculate-block__search" placeholder="Поиск..." v-model="searchQuery" />

    <template v-if="products.length > 0">
      <div class="products">
        <CatalogProduct class="product" v-for="product in products" :key="product.id" :product="product" />
      </div>

      <!-- Используем новый компонент пагинации -->
      <MainPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-count="totalCount"
        :per-page="perPage"
        @update:currentPage="handlePageChange"
        @page-change="handlePageChange"
      />
    </template>

    <div v-else-if="searchQuery && !products.length" class="no-products">
      Товары не найдены
    </div>
  </div>
</template>

<style scoped>
.products {
  margin-top: 15px;
  max-width: 930px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.no-products {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}
</style>
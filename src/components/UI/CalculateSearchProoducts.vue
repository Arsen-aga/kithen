<script setup>
import { ref, watch, computed } from 'vue'
import { useApi } from '@/helpers/useApi'
import { toast } from 'vue3-toastify'
import SearchInput from '@/components/UI/SearchInput.vue'
import CatalogProduct from '@/components/CatalogProduct.vue'

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

// Параметры пагинации из заголовков
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

    // Добавляем параметры пагинации
    params.append('page', page)
    params.append('limit', perPage.value)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await get(url, true)

    // Получаем заголовки пагинации из ответа
    // В зависимости от того, как возвращается ответ, может быть:
    // response.headers или response.config или отдельный объект с заголовками

    // Пример для axios:
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

    // Предполагаем, что сам ответ - это массив товаров
    products.value = response.data || response

    if (products.value.length === 0) {
      toast.error('Товары не найдены', { autoClose: 1000 })
       emit('update:showProducts', true)
    }

    console.log('products.value', products.value)
    console.log('pagination', {
      currentPage: currentPage.value,
      totalPages: totalPages.value,
      totalCount: totalCount.value,
      perPage: perPage.value,
    })
  } catch (error) {
    console.error(error)
    products.value = []
    totalPages.value = 0
    totalCount.value = 0
  }
}

watch(
  () => searchQuery.value,
  () => {
    clearTimeout(searchTimeout.value)
    // Сбрасываем на первую страницу при новом поиске
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

// Функции для навигации
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    getProducts(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    getProducts(currentPage.value - 1)
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    getProducts(page)
  }
}

// Вычисляемые свойства для пагинации
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

// Для отображения диапазона страниц
const pageRange = computed(() => {
  if (totalPages.value <= 7) {
    // Если страниц мало, показываем все
    return Array.from({ length: totalPages.value }, (_, i) => i + 1)
  }

  const delta = 2 // сколько страниц показывать до и после текущей
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= totalPages.value; i++) {
    if (i === 1 || i === totalPages.value || (i >= currentPage.value - delta && i <= currentPage.value + delta)) {
      range.push(i)
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  })

  return rangeWithDots
})

// Информация о текущем диапазоне товаров
const itemsRangeStart = computed(() => (totalCount.value ? (currentPage.value - 1) * perPage.value + 1 : 0))

const itemsRangeEnd = computed(() => Math.min(currentPage.value * perPage.value, totalCount.value))

watch(() => products.value, (newProducts) => {
  // Если есть результаты поиска, показываем блок с товарами
  if (newProducts.length > 0 ) {
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

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="pagination-container">
        <!-- Информация о количестве товаров -->
        <div class="pagination-info">
          Показано {{ itemsRangeStart }}-{{ itemsRangeEnd }} из {{ totalCount }} товаров
        </div>

        <div class="pagination">
          <!-- Кнопка "В начало" -->
          <button
            class="pagination__button pagination__button--nav"
            :disabled="!hasPreviousPage"
            @click="goToPage(1)"
            title="Первая страница"
          >
            «
          </button>

          <!-- Кнопка "Предыдущая" -->
          <button
            class="pagination__button pagination__button--nav"
            :disabled="!hasPreviousPage"
            @click="prevPage"
            title="Предыдущая страница"
          >
            ←
          </button>

          <!-- Номера страниц -->
          <template v-for="(page, index) in pageRange" :key="index">
            <button
              v-if="page !== '...'"
              class="pagination__button"
              :class="{ 'pagination__button--active': currentPage === page }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="pagination__dots">...</span>
          </template>

          <!-- Кнопка "Следующая" -->
          <button
            class="pagination__button pagination__button--nav"
            :disabled="!hasNextPage"
            @click="nextPage"
            title="Следующая страница"
          >
            →
          </button>

          <!-- Кнопка "В конец" -->
          <button
            class="pagination__button pagination__button--nav"
            :disabled="!hasNextPage"
            @click="goToPage(totalPages)"
            title="Последняя страница"
          >
            »
          </button>
        </div>

        <select v-if="false" class="pagination__per-page" v-model="perPage" @change="goToPage(1)">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </template>

    <!-- Сообщение, если товаров нет -->
    <div v-else-if="searchQuery && !products.length" class="no-products">Товары не найдены</div>
  </div>
</template>

<style scoped>
.products {
  margin-top: 15px;
  max-width: 930px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.pagination__button {
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination__button--nav {
  font-size: 18px;
  line-height: 1;
}

.pagination__button:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.pagination__button--active {
  background-color: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.pagination__button--active:hover {
  background-color: #0056b3;
}

.pagination__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8f9fa;
}

.pagination__dots {
  padding: 0 5px;
  color: #6c757d;
}

.pagination__per-page {
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.no-products {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}
</style>

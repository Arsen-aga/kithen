<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Текущая страница
  currentPage: {
    type: Number,
    required: true,
  },
  // Общее количество страниц
  totalPages: {
    type: Number,
    required: true,
  },
  // Общее количество элементов
  totalCount: {
    type: Number,
    default: 0,
  },
  // Количество элементов на странице
  perPage: {
    type: Number,
    default: 20,
  },
  // Показывать ли информацию о количестве элементов
  showInfo: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:currentPage', 'page-change'])

// Вычисляемые свойства для навигации
const hasPreviousPage = computed(() => props.currentPage > 1)
const hasNextPage = computed(() => props.currentPage < props.totalPages)

// Диапазон отображаемых страниц
const pageRange = computed(() => {
  if (props.totalPages <= 7) {
    return Array.from({ length: props.totalPages }, (_, i) => i + 1)
  }

  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= props.totalPages; i++) {
    if (i === 1 || i === props.totalPages || (i >= props.currentPage - delta && i <= props.currentPage + delta)) {
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

// Информация о текущем диапазоне элементов
const itemsRangeStart = computed(() => (props.totalCount ? (props.currentPage - 1) * props.perPage + 1 : 0))

const itemsRangeEnd = computed(() => Math.min(props.currentPage * props.perPage, props.totalCount))

// Методы навигации
const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('page-change', page)
  }
}

const nextPage = () => {
  if (hasNextPage.value) {
    goToPage(props.currentPage + 1)
  }
}

const prevPage = () => {
  if (hasPreviousPage.value) {
    goToPage(props.currentPage - 1)
  }
}

</script>

<template>
  <div v-if="totalPages > 0" class="pagination-container">
    <!-- Информация о количестве элементов -->
    <div v-if="showInfo && totalCount > 0" class="pagination-info">
      Показано {{ itemsRangeStart }}-{{ itemsRangeEnd }} из {{ totalCount }} элементов
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
  </div>
</template>

<style scoped>
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
  background-color: var(--accent-color, #007bff);
  color: white;
  border-color: var(--accent-color, #007bff);
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
</style>

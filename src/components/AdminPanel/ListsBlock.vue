<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDefaultItems } from '@/stores/default'
import axios from 'axios'
import router from '@/router/router'

const props = defineProps({
  propsPage: String,
  typePage: String,
})

const emit = defineEmits(['goToCategory'])
const store = useDefaultItems()

const searchQuery = ref('')
const sortBy = ref('idAsc') // Возможные значения: idAsc, idDesc, nameAsc, nameDesc
const categories = ref([])
const user = ref(store.getUser)
const apiUrl = ref(store.getApiUrl)

// Фильтрация и сортировка категорий
const filteredCategories = computed(() => {
  let filtered = []
  if (categories.value?.categories) {
    filtered = categories.value?.categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categories.value?.news) {
    filtered = categories.value?.news.filter((category) =>
      category.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categories.value?.podcasts) {
    filtered = categories.value?.podcasts.filter((category) =>
      category.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categories.value?.themes) {
    filtered = categories.value?.themes.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categories.value?.videos) {
    filtered = categories.value?.videos.filter((category) =>
      category.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categories.value?.books) {
    filtered = categories.value?.books.filter((category) =>
      category.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categories.value?.materials) {
    filtered = categories.value?.materials.filter((category) =>
      category.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categories.value?.notifies) {
    filtered = categories.value?.notifies.filter((category) =>
      category.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categories.value?.tests) {
    filtered = categories.value?.tests.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categories.value?.bloggers) {
    filtered = categories.value?.bloggers.filter((category) =>
      category.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (sortBy.value === 'idAsc') {
    return filtered.sort((a, b) => a.id - b.id)
  } else if (sortBy.value === 'idDesc') {
    return filtered.sort((a, b) => b.id - a.id)
  } else if (sortBy.value === 'nameAsc') {
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'nameDesc') {
    return filtered.sort((a, b) => b.name.localeCompare(a.name))
  }

  return filtered
})

// Методы для фильтрации
const sortByF = (event, asc) => {
  let items = document.querySelectorAll('.filteres')
  items.forEach((item) => {
    item.classList.remove('active')
  })
  let item = event.target
  item.classList.add('active')
  sortBy.value = asc
}
const sortByIdDesc = () => {
  sortBy.value = 'idDesc'
}
const sortByNameAsc = () => {
  sortBy.value = 'nameAsc'
}
const sortByNameDesc = () => {
  sortBy.value = 'nameDesc'
}
// Метод для навигации к компоненту категории
const goToCategory = (item, type) => {
  item.type = type
  emit('goToCategory', item)
}
// Метод для редактирования категории
const editCategory = (category) => {
  router.push({ name: 'EditCategory', params: { id: category.id } })
}
// Метод для удаления категории
const deleteCategory = async (id) => {
  if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
    let authGet = `&auth=${user.value.username}:${user.value.auth_key}`
    let params = {
      id: id,
    }

    try {
      await axios.post(apiUrl.value + 'api-' + props.propsPage + '/del' + authGet, params, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      getContent() // обновить данные после удаления
    } catch (error) {
      console.error('Ошибка при удалении категории:', error)
    }
  } else {
    console.log('Удаление отменено пользователем')
  }
}
const getContent = () => {
  let cat = props.propsPage.includes('-category')
  let authGet = `&auth=${user.value.username}:${user.value.auth_key}`
  if (props.propsPage === 'theme' || props.propsPage === 'blogger' || cat) {
    axios.get(apiUrl.value + 'api-' + props.propsPage + '/get-list' + authGet).then((response) => {
      categories.value = response.data
      console.log(categories.value)
    })
  } else {
    axios.get(apiUrl.value + 'api-' + props.propsPage + '/get-admin-list' + authGet).then((response) => {
      categories.value = response.data
    })
  }
}

// Метод для добавления категории
const addCategory = () => {
  emit('goToCategory')
}

onMounted(() => getContent())
watch(
  () => props.propsPage,
  () => {
    getContent()
  }
)
</script>

<template>
  <div class="categories">
    <!-- Кнопка для добавления категории -->
    <div class="categories__actions">
      <button class="btn-white" @click="addCategory">Добавить</button>
    </div>

    <!-- Поиск и фильтры -->
    <div class="categories__filters">
      <input v-model="searchQuery" type="text" placeholder="Поиск категории..." />

      <button class="btn-white filteres" @click="sortByF($event, 'idAsc')">ID ↑</button>
      <button class="btn-white filteres" @click="sortByF($event, 'idDesc')">ID ↓</button>
      <button class="btn-white filteres" @click="sortByF($event, 'nameAsc')">Имя A-Z</button>
      <button class="btn-white filteres" @click="sortByF($event, 'nameDesc')">Имя Z-A</button>
    </div>

    <!-- Таблица категорий -->
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Название категории</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in filteredCategories" :key="category.id">
          <td>{{ category.id }}</td>
          <td @click="goToCategory(category, propsPage)" class="category-name">
            {{ category?.name || category?.title }}
          </td>
          <td class="table-actions">
            <button class="btn-white" @click="goToCategory(category, propsPage)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-pencil-square"
                viewBox="0 0 16 16"
              >
                <path
                  d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
                />
                <path
                  fill-rule="evenodd"
                  d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                />
              </svg>
            </button>
            <button v-if="!this.categories.themes" class="btn-white btn-danger" @click="deleteCategory(category.id)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-trash3"
                viewBox="0 0 16 16"
              >
                <path
                  d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"
                />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.categories__actions {
  margin-bottom: 20px;
}

.categories__filters {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
  align-items: center;
}

input[type='text'] {
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 15px;
  text-align: left;
}

th {
  background-color: #f1f1f1;
  font-weight: bold;
}

td {
  border-bottom: 1px solid #ddd;
}

.category-name {
  cursor: pointer;
  color: #5f22c1;
  text-decoration: underline;
}

.btn-danger {
  background-color: #e90037;
  color: white;
}
.btn-white {
  color: #5f22c1;
  text-align: center;
  font-family: 'Proxima Nova';
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px; /* 112.5% */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f1f1f1;
  border-radius: 10px;
  width: max-content;
  padding: 8px;
  cursor: pointer;
}
.table-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>

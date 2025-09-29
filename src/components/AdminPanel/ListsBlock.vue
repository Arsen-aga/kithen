<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDefaultItems } from '@/stores/default'
import axios from 'axios'
import { toast } from 'vue3-toastify'
const props = defineProps({
  propsPage: String,
})

const emit = defineEmits(['goToCategory'])
const store = useDefaultItems()

const searchQuery = ref('')
const sortBy = ref('idAsc') // Возможные значения: idAsc, idDesc, nameAsc, nameDesc
const categories = ref([])
const user = ref(store.getUser)
const apiUrl = ref(store.getApiDomain)
const attributeGroups = ref([])
console.log(store.getBearer)

// Фильтрация и сортировка категорий
const filteredCategories = computed(() => {
  console.log(categories.value)
  let filtered = []
  if (Array.isArray(categories.value)) {
    filtered = categories.value?.filter((category) => {
      if (category.Name) {
        return category.Name.toLowerCase().includes(searchQuery.value.toLowerCase())
      } else {
        return category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      }
    })
  }
  if (sortBy.value === 'idAsc') {
    return filtered.sort((a, b) => a.id - b.id)
  } else if (sortBy.value === 'idDesc') {
    return filtered.sort((a, b) => b.id - a.id)
  } else if (sortBy.value === 'nameAsc') {
    return filtered.sort((a, b) => {
      if (a.Name) {
        return a.Name.localeCompare(b.Name)
      } else {
        return a.name.localeCompare(b.name)
      }
    })
  } else if (sortBy.value === 'nameDesc') {
    return filtered.sort((a, b) => {
      if (b.Name) {
        return b.Name.localeCompare(a.Name)
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
  let items = document.querySelectorAll('.filteres')
  items.forEach((item) => {
    item.classList.remove('active')
  })
  let item = event.target
  item.classList.add('active')
  sortBy.value = asc
}

// Метод для навигации к компоненту категории
const goToCategory = (item, type) => {
  item.typePage = type
  emit('goToCategory', item)
}

const addCategory = () => {
  emit('goToCategory', null)
}

const getContent = () => {
  const config = {
    headers: {
      Authorization: `Bearer ${user.value.bearer}`,
    },
  }
  axios.get(apiUrl.value + '/' + props.propsPage, config).then((response) => {
    categories.value = response.data
    console.log(props.propsPage)
  })
}

const deleteCategory = async (id) => {
  const config = {
    headers: {
      Authorization: `Bearer ${user.value.bearer}`,
    },
  }
  const link = `${store.getApiDomain}/${props.propsPage}/${id}`
  console.log(link)
  try {
    const response = await axios.delete(link, config)
    categories.value = categories.value.filter((category) => category.id !== id)
    console.log(response.data)
    toast.success('Категория удалена', { autoClose: 1000 })
  } catch (error) {
    console.error(error)
    toast.error('Ошибка в удалении', { autoClose: 1000 })
    await getContent()
  }
}

const loadAttributeGroups = async () => {
  const config = {
    headers: {
      Authorization: `Bearer ${user.value.bearer}`,
    },
  }
  try {
    const response = await axios.get(`${store.getApiDomain}/product-attribute-groups`, config)
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

onMounted(async () => {
  await getContent()
  // Загружаем группы атрибутов если это страница атрибутов
  if (props.propsPage === 'product-attributes') {
    await loadAttributeGroups()
  }
})

watch(
  () => props.propsPage,
  async () => {
    await getContent()
    // Загружаем группы атрибутов если это страница атрибутов
    if (props.propsPage === 'product-attributes') {
      await loadAttributeGroups()
    }
  }
)
</script>

<template>
  <div class="categories">
    <!-- Кнопка для добавления категории -->
    <div class="categories__actions">
      <button class="btn-white" @click="addCategory" v-if="propsPage !== 'products'">Добавить</button>
    </div>

    <!-- Поиск и фильтры -->
    <div class="categories__filters">
      <input v-model="searchQuery" type="text" placeholder="Поиск категории..." />

      <button class="btn-white filteres" @click="sortByF($event, 'idAsc')">ID ↑</button>
      <button class="btn-white filteres" @click="sortByF($event, 'idDesc')">ID ↓</button>
      <button class="btn-white filteres" @click="sortByF($event, 'nameAsc')">Имя A-Z</button>
      <button class="btn-white filteres" @click="sortByF($event, 'nameDesc')">Имя Z-A</button>
      <button class="btn-white filteres" @click="sortByF($event, 'groupIdAsc')">Группа ID</button>
      <button class="btn-white filteres" @click="sortByF($event, 'groupIdDesc')">Группа ID</button>
    </div>

    <!-- Таблица категорий -->
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Название категории</th>
          <th v-if="props.propsPage === 'product-attributes'">Название Группы</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in filteredCategories" :key="category.id">
          <td>{{ category.id }}</td>
          <td @click="goToCategory(category, propsPage)" class="category-name">
            {{ category?.Name || category?.name }}
            {{ category.exists }}
          </td>
          <td class="category-name" v-if="props.propsPage === 'product-attributes'">
            {{ getGroupName(category.group_id || category.attribute_group_id) }}
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
            <button
              v-if="!categories.Group"
              class="btn-white"
              :class="{
                'btn-danger': category.exists === 0,
              }"
              @click="deleteCategory(category.id)"
            >
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
  background-color: #707070;
  font-weight: bold;
  color: #fff;
}

td {
  border-bottom: 1px solid #ddd;
}

.category-name {
  cursor: pointer;
  color: #5f22c1;
  text-decoration: underline;
}

.btn-white {
  color: #5f22c1;
  text-align: center;
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
.btn-danger {
  background-color: #e90037;
  color: white;
}
.table-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>

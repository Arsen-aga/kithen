<script>
import axios from "axios";

export default {
  name: "ListsBlock",
  props: {
    propsPage: {
      type: String,
    },
    typePage: {
      type: String,
    },
  },
  data() {
    return {
      searchQuery: "",
      sortBy: "idAsc", // Возможные значения: idAsc, idDesc, nameAsc, nameDesc
      categories: [],
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
    };
  },
  computed: {
    // Фильтрация и сортировка категорий
    filteredCategories() {
      let filtered = [];
      if (this.categories?.categories) {
        filtered = this.categories?.categories.filter((category) =>
          category.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.categories?.news) {
        filtered = this.categories?.news.filter((category) =>
          category.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.categories?.podcasts) {
        filtered = this.categories?.podcasts.filter((category) =>
          category.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.categories?.themes) {
        filtered = this.categories?.themes.filter((category) =>
          category.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.categories?.videos) {
        filtered = this.categories?.videos.filter((category) =>
          category.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.categories?.books) {
        filtered = this.categories?.books.filter((category) =>
          category.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.categories?.materials) {
        filtered = this.categories?.materials.filter((category) =>
          category.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.categories?.notifies) {
        filtered = this.categories?.notifies.filter((category) =>
          category.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.categories?.tests) {
        filtered = this.categories?.tests.filter((category) =>
          category.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.categories?.bloggers) {
        filtered = this.categories?.bloggers.filter((category) =>
          category.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.sortBy === "idAsc") {
        return filtered.sort((a, b) => a.id - b.id);
      } else if (this.sortBy === "idDesc") {
        return filtered.sort((a, b) => b.id - a.id);
      } else if (this.sortBy === "nameAsc") {
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.sortBy === "nameDesc") {
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      }

      return filtered;
    },
  },
  methods: {
    // Методы для фильтрации
    sortByF(event, asc) {
      let items = document.querySelectorAll(".filteres");
      items.forEach((item) => {
        item.classList.remove("active");
      });
      let item = event.target;
      item.classList.add("active");
      this.sortBy = asc;
    },
    sortByIdDesc() {
      this.sortBy = "idDesc";
    },
    sortByNameAsc() {
      this.sortBy = "nameAsc";
    },
    sortByNameDesc() {
      this.sortBy = "nameDesc";
    },

    // Метод для навигации к компоненту категории
    goToCategory(item, type) {
      item.type = type;
      this.$emit("goToCategory", item);
    },

    // Метод для редактирования категории
    editCategory(category) {
      this.$router.push({ name: "EditCategory", params: { id: category.id } });
    },

    // Метод для удаления категории
    async deleteCategory(id) {
      if (confirm("Вы уверены, что хотите удалить этот элемент?")) {
        let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
        let params = {
          id: id,
        };

        try {
           await axios.post(
            this.apiUrl + "api-" + this.propsPage + "/del" + authGet,
            params,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          this.getContent(); // обновить данные после удаления
        } catch (error) {
          console.error("Ошибка при удалении категории:", error);
        }
      } else {
        console.log("Удаление отменено пользователем");
      }
    },
    getContent() {
      let cat = this.propsPage.includes('-category');
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      if (this.propsPage === "theme" || this.propsPage === "blogger" || cat) {
        axios
          .get(this.apiUrl + "api-" + this.propsPage + "/get-list" + authGet)
          .then((response) => {
            this.categories = response.data;
            console.log(this.categories);
          });
      } else {
        axios
          .get(
            this.apiUrl + "api-" + this.propsPage + "/get-admin-list" + authGet
          )
          .then((response) => {
            this.categories = response.data;
           
            
          });
      }
    },

    // Метод для добавления категории
    addCategory() {
      this.$emit("goToCategory");
    },
  },
  mounted() {
    
    
    this.getContent();
  },
  watch: {
    propsPage() {
      
      this.getContent();
    },
  },
};
</script>

<template>
  <div class="categories">
    <!-- Кнопка для добавления категории -->
    <div class="categories__actions">
      <button class="btn-white" @click="addCategory">Добавить</button>
    </div>

    <!-- Поиск и фильтры -->
    <div class="categories__filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск категории..."
      />

      <button class="btn-white filteres" @click="sortByF($event, 'idAsc')">
        ID ↑
      </button>
      <button class="btn-white filteres" @click="sortByF($event, 'idDesc')">
        ID ↓
      </button>
      <button class="btn-white filteres" @click="sortByF($event, 'nameAsc')">
        Имя A-Z
      </button>
      <button class="btn-white filteres" @click="sortByF($event, 'nameDesc')">
        Имя Z-A
      </button>
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
            <button
              class="btn-white"
              @click="goToCategory(category, propsPage)"
            >
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
              v-if="!this.categories.themes"
              class="btn-white btn-danger"
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

input[type="text"] {
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
  font-family: "Proxima Nova";
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

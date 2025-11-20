<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminLogo from '../UI/AdminLogo.vue'
const menuItems = ref([
  {
    id: 0,
    name: 'Товары',
    path: '',
    subcategories: [
      { id: 0, name: 'Категории товаров', path: 'external-categories' },
      { id: 1, name: 'Товары', path: 'external-products' },
      { id: 2, name: 'Группы атрибутов', path: 'external-product-attribute-groups' },
      { id: 3, name: 'Атрибуты', path: 'external-product-attributes' },
    ],
  },
  {
    id: 1,
    name: 'Пользователи',
    path: 'users',
    subcategories: [],
  },
])

// Состояние открытых категорий
const openStates = ref({})

const toggleShow = (itemId) => {
  openStates.value[itemId] = !openStates.value[itemId]
}

const isOpen = (itemId) => {
  return !!openStates.value[itemId]
}
</script>
<template>
  <div class="sideBar__content">
    <div class="accHead">
      <AdminLogo />
      <div class="head-text">Административная панель</div>
    </div>
    <div class="accBody">
      <div v-for="item in menuItems" :key="item.id">
        <RouterLink
          v-if="item.path"
          :to="{ name: 'List', params: { pathName: item.path } }"
          class="acc__link"
          active-class="active"
        >
          {{ item.name }}
        </RouterLink>
        <p v-else @click="toggleShow(item.id)" class="acc__link" :class="{ active: isOpen(item.id) }">
          {{ item.name }}
        </p>
        <div v-if="item.subcategories && isOpen(item.id)" class="subcategories">
          <RouterLink
            v-for="(sub, index) in item.subcategories"
            :key="index"
            :to="{ name: 'List', params: { pathName: sub.path } }"
            class="acc__link sub-link"
            active-class="active"
          >
            {{ sub.name }}
          </RouterLink>
        </div>
      </div>
    </div>
    <div class="back-link">
      <div class="links">
        <router-link to="/" class="exit link">Выйти</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sideBar__content {
  display: flex;
  flex-direction: column;
  gap: 64px;
  padding: 42px 51px;
  align-items: center;
  height: 100%;
}
.accHead {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}
.head-text {
  color: #fff;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.accBody {
  display: flex;
  flex-direction: column;
  gap: 23px;
  width: 100%;
}
.acc__link {
  position: relative;
  color: #fff;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding-bottom: 10px;
  cursor: pointer;
}
.acc__link.active::before {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 28px;
  height: 2px;
  background: #fff;
}
.subcategories {
  display: flex;
  flex-direction: column;
  padding-left: 20px;
  gap: 10px;
  margin-top: 10px;
}
.sub-link {
  font-weight: 400;
  color: #ddd;
}

.back-link {
  margin-top: auto;
  display: flex;
  align-items: center;
  width: 100%;
}
.links {
  display: flex;
  gap: 24px;
  width: 100%;
}
.link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: 10px 30px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  max-width: 100%;
  width: 100%;
  transition: background 0.3s ease;
}

.link:hover {
  background: #4b5563;
}
</style>

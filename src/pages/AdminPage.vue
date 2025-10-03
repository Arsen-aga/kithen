<script setup>
import SideBarAdmin from '@/components/AdminPanel/SideBarAdmin.vue'
import HeaderAdmin from '@/components/AdminPanel/HeaderAdmin.vue'
import ListsBlock from '@/components/AdminPanel/ListsBlock.vue'
import UniversalPage from '@/components/AdminPanel/UniversalPage.vue'
// import MetrikaBlock from '@/components/AdminPanel/MetrikaBlock.vue'
import router from '@/router/router'
import { ref, onMounted, computed } from 'vue'
import { useDefaultItems } from '@/stores/default'

const store = useDefaultItems()
const user = computed(() => store.getUser)

const list = ref(true)
const updatePage = ref(false)
const propsPage = ref('metrika')
const itemPage = ref(null)

const goToCategory = (item = null) => {
  itemPage.value = item
  list.value = false
  updatePage.value = true
}
const goTo = (item) => {
  switch (item) {
    case 'products':
      propsPage.value = 'products'
      break
    case 'product-groups':
      propsPage.value = 'product-groups'
      break
    case 'product-attribute-groups':
      propsPage.value = 'product-attribute-groups'
      break
    case 'product-attributes':
      propsPage.value = 'product-attributes'
      break
    case 'users':
      propsPage.value = 'users'
      break
    case 'notify':
      propsPage.value = 'notify'
      break
  }

  list.value = true
  updatePage.value = false
  itemPage.value = null
}

onMounted(() => {
  if (user.value.username === 'guest' || user.value.username !== 'potapov.roma@mail.ru') {
    console.log(user)
    // router.push('/nelzya-tuda')
    router.push('/admin')
  }
})
</script>

<template>
  <div class="wrapperAcc">
    <div class="sidebar">
      <SideBarAdmin @goTo="goTo" />
    </div>

    <div class="info">
      <HeaderAdmin />
      <!-- <metrika-block v-if="propsPage == 'metrika'" /> -->
      <ListsBlock v-if="list && propsPage != 'metrika'" @goToCategory="goToCategory" :propsPage="propsPage" />
      <UniversalPage v-if="updatePage && propsPage != 'metrika'" :propsPage="propsPage" :item="itemPage" />
    </div>
  </div>
</template>

<style scoped>
.wrapperAcc {
  display: flex;
  padding-right: 30px;
  gap: 51px;
}
.sidebar {
  width: 308px;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
  background: #464649;
}
.info {
  width: 100%;
  max-width: 954px;
}
</style>

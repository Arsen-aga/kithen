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

const goToCategory = (item = false) => {
  if (item) {
    itemPage.value = item
  }
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
    case 'users':
      propsPage.value = 'users'
      break
    case 'notify':
      propsPage.value = 'notify'
      break
  }
  if (!list.value) {
    list.value = true
    updatePage.value = false
  }
}

onMounted(() => {
  if (user.value.username === 'guest' || user.value.username !== 'potapov.roma@mail.ru') {
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
      <ListsBlock
        v-if="list && propsPage != 'metrika'"
        @goToCategory="goToCategory"
        :propsPage="propsPage"
        :type="typePage"
      />
      <UniversalPage v-if="updatePage && !itemPage && propsPage != 'metrika'" :propsPage="propsPage" />
      <UniversalPage v-if="updatePage && itemPage && propsPage != 'metrika'" :propsPage="propsPage" :item="itemPage" />
    </div>
  </div>
</template>
<style scoped>
.wrapperAcc {
  display: flex;
  background: #f5f7f8;
  padding-right: 30px;
  gap: 51px;
}
.sidebar {
  width: 308px;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
  background: #333333;
}
.info {
  width: 100%;
  max-width: 954px;
}
</style>

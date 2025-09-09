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
    case 'podcasts':
      propsPage.value = 'podcast'
      break
    case 'news':
      propsPage.value = 'news'
      break
    case 'video':
      propsPage.value = 'video'
      break
    case 'podcast-category':
      propsPage.value = 'podcast-category'
      break
    case 'news-category':
      propsPage.value = 'news-category'
      break
    case 'video-category':
      propsPage.value = 'video-category'
      break
    case 'book-category':
      propsPage.value = 'book-category'
      break
    case 'test-category':
      propsPage.value = 'test-category'
      break
    case 'material':
      propsPage.value = 'material'
      break
    case 'theme':
      propsPage.value = 'theme'
      break
    case 'notify':
      propsPage.value = 'notify'
      break
    case 'test':
      propsPage.value = 'test'
      break
    case 'blogger':
      propsPage.value = 'blogger'
      break
    case 'book':
      propsPage.value = 'book'
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
      <metrika-block v-if="propsPage == 'metrika'" />
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

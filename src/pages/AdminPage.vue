<script setup>
import SideBarAdmin from '@/components/AdminPanel/SideBarAdmin.vue'
import HeaderAdmin from '@/components/AdminPanel/HeaderAdmin.vue'
// import MetrikaBlock from '@/components/AdminPanel/MetrikaBlock.vue'
import router from '@/router/router'
import { onMounted, computed } from 'vue'
import { useDefaultItems } from '@/stores/default'
import { RouterView } from 'vue-router'

const store = useDefaultItems()
const user = computed(() => store.getUser)

onMounted(() => {
  if (user.value.username === 'guest' || user.value.username !== 'potapov.roma@mail.ru') {
    console.log(user.value)
    // router.push('/login')
    router.push('/admin')
  }
})
</script>

<template>
  <div class="wrapperAcc">
    <div class="sidebar">
      <SideBarAdmin />
    </div>

    <div class="info">
      <HeaderAdmin />
      <RouterView />
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

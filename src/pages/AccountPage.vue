<script setup>
import { useApi } from '@/helpers/useApi'
import CalculateBlock from '../components/CalculateBlock.vue'
import ReviewBlock from '../components/ReviewBlock.vue'
import { useSmetaStore } from '@/stores/smeta/index'
import { onMounted, ref } from 'vue'

const { get } = useApi()
const smetaStore = useSmetaStore()
const guidOrder = ref(null)
const dateOrder = ref(null)
const showLoader = ref(false)
const time = ref(0)

const getOrder = async () => {
  try {
    const response = await get('orders')
    guidOrder.value = response[0].s_guid
    dateOrder.value = response[0].s_date
    return response[0]
  } catch (error) {
    console.log(error)
  }
}

const updateOrder = async () => {
  try {
    await getOrderToId(guidOrder.value)
  } catch (error) {
    console.log(error)
  }
}

const getOrderToId = async (id) => {
  try {
    const response = await get(`orders?s_guid=${id}`)
    time.value++
    // console.log('time', time.value);
    // console.log('response[0].s_date', response[0].s_date);
    // console.log('dateOrder.value', dateOrder.value);
    if (response[0].s_date === dateOrder.value) return

    showLoader.value = true
    dateOrder.value = response[0].s_date
    smetaStore.initSmeta(response[0])
    
    setTimeout(() => {
      showLoader.value = false
    }, 4000);
  } catch (error) {
    console.log(error)
  }
}


onMounted(async () => {
  smetaStore.initSmeta(await getOrder())
  // console.log('smetaStore.smeta', smetaStore.smeta)
  if (smetaStore.smeta && guidOrder.value) {
    setInterval(() => updateOrder(), 5000)
  }
})

// const getUsers = async () => {
//   try {
//     const response = await get('user-profiles')
//     console.log('response', response)
//   } catch (error) {
//     console.log(error)
//   }
// }
</script>
<template>
  <!-- <button @click="getUsers">Получить Пользователей</button> -->
  <div class="app-component">
    <CalculateBlock />
    <ReviewBlock />
  </div>
  <div v-if="showLoader" class="loader">
    <p class="loader__text">Загрузка...</p>
    <div class="spinner"></div>
  </div>
</template>
<style lang="scss" scoped>
.app-component {
  max-width: 1920px;
  padding: 20px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1320px) minmax(0, 540px);
  gap: 20px;
}
.loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffffe3;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 120px;
  height: 120px;
  border: 8px solid #e5e7eb;
  border-top: 8px solid #dba250;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.loader__text {
  position: absolute;
  font-size: 14px;
  opacity: 0.9;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

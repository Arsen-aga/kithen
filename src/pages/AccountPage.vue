<script setup>
import { useApi } from '@/helpers/useApi'
import CalculateBlock from '../components/CalculateBlock.vue'
import ReviewBlock from '../components/ReviewBlock.vue'
import { useSmetaStore } from '@/stores/smeta'
import { onMounted } from 'vue'

const { get } = useApi()
const smetaStore = useSmetaStore()

const getOrder = async () => {
  try {
    const response = await get('orders')
    return getOneOrder(response)
  } catch (error) {
    console.log(error)
  }
}
const getOneOrder = (orders) => {
  const parsOrder = JSON.parse(orders[0].order)
  return parsOrder
}
// const getUsers = async () => {
//   try {
//     const response = await get('user-profiles')
//     console.log('response', response)
//   } catch (error) {
//     console.log(error)
//   }
// }

onMounted(async () => {
  smetaStore.initSmeta(await getOrder())
  console.log('smetaStore.smeta', smetaStore.smeta);
})
</script>
<template>
  <!-- <button @click="getUsers">Получить Пользователей</button> -->
  <div class="app-component">
    <CalculateBlock />
    <ReviewBlock />
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
  /* position: relative; */
}
</style>

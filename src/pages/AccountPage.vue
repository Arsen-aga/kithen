<script setup>
import { useApi } from '@/helpers/useApi'
import CalculateBlock from '../components/CalculateBlock.vue'
import ReviewBlock from '../components/ReviewBlock.vue'

const { get } = useApi()

const getOrders = async () => {
  try {
    const response = await get('orders')
    console.log('response', response)
  } catch (error) {
    console.log(error)
  }
}
const getUsers = async () => {
  try {
    const response = await get('user-profiles')
    console.log('response', response)
  } catch (error) {
    console.log(error)
  }
}
</script>
<template>
  <button @click="getOrders">Получить заказы</button>
  <button @click="getUsers">Получить Пользователей</button>
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

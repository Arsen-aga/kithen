import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useShippingDate = defineStore('shippingDate', () => {
  const shippingDate = ref(new Date())

  const changeShippingDate = (date) => {
    shippingDate.value = date
  }

  return { shippingDate, changeShippingDate }
})

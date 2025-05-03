import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usemarketBlock = defineStore('marketBlock', () => {
  const marketBlock = ref([])

  return { marketBlock }
})

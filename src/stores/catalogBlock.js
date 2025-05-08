import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCatalogBlock = defineStore('catalogBlock', () => {
  const catalogBlock = ref([])

  return { catalogBlock }
})

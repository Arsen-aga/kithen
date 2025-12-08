import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCatalogBlock = defineStore('catalogBlock', () => {
  const isOpenCatalog = ref(false)
  const catalogCategory = ref(null)

  function changeCatalogCategory(catId) {
    catalogCategory.value = catId
  }

  function openCatalog(catId) {
    console.log('test', catId)
    changeCatalogCategory(catId)
    isOpenCatalog.value = true
  }

  function closeCatalog() {
    isOpenCatalog.value = false
  }

  return {
    catalogCategory,
    openCatalog,
    closeCatalog,
    isOpenCatalog,
  }
})

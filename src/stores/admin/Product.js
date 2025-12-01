import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useProduct = defineStore('product', () => {
  const product = ref({
    id: null,
    categories: [],
  })

  // Устанавливаем данные товара (при загрузке)
  const setProduct = (productData) => {
    product.value = {
      ...productData,
      categories: productData.categories || [],
    }
  }
  const addCategory = (category) => {
    // Проверяем, нет ли уже такой категории
    const existingCategory = product.value.categories.find((cat) => cat.id === category.id)
    if (!existingCategory) {
      product.value.categories.push(category)
    }
  }

  // Удаляем категорию из товара
  const removeCategory = (categoryId) => {
    product.value.categories = product.value.categories.filter((cat) => cat.id !== categoryId)
  }

  // Очищаем все категории
  const clearCategories = () => {
    product.value.categories = []
  }

  // Получаем список категорий товара
  const getCategories = computed(() => product.value.categories)

  // Проверяем, есть ли категория у товара
  const hasCategory = (categoryId) => {
    return product.value.categories.some((cat) => cat.id === categoryId)
  }

  return {
    product,
    setProduct,
    addCategory,
    removeCategory,
    clearCategories,
    getCategories,
    hasCategory,
  }
})

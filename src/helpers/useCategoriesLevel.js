import { useApi } from '@/helpers/useApi'
import { toast } from 'vue3-toastify'

export const useCategoriesLevel = () => {
  const { get } = useApi()

  const getAllCategories = async (searchQuery, page = 1) => {
    let url = `product-groups?page=${page}`
    if (searchQuery) {
      url += `&Name=${encodeURIComponent(searchQuery)}`
    }

    try {
      const categories = await get(url)
      return categories
    } catch (error) {
      console.error(error)
      toast.error('Ошибка загрузки категорий', { autoClose: 1000 })
      return []
    }
  }

  const getCategoryName = async (currentId) => {
    if (!currentId) {
      return 'Без родительской категории(корневая)'
    }
    console.log('getCategoryName currentId', currentId)
    try {
      const category = await get(`product-groups/${currentId}`)
      console.log('getCategoryName category.Name', category)
      return category.Name || 'Без родительской категории(корневая)'
    } catch (error) {
      console.error(error)
      return 'Без родительской категории(корневая)'
    }
  }
  return {
    getAllCategories,
    getCategoryName,
  }
}

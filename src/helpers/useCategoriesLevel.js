import { useApi } from '@/helpers/useApi'
import { toast } from 'vue3-toastify'

export const useCategoriesLevel = () => {
  const { get } = useApi()

  const getAllCategories = async (currentId, searchQuery) => {
    let url = `product-groups`
    if (searchQuery) {
      url += `?Name=${encodeURIComponent(searchQuery)}`
    }

    try {
      const categories = await get(url)
      const filterCategories = categories.filter((cat) => {
        return cat.level !== 2 && cat.parent_id !== Number(currentId) && cat.id !== Number(currentId)
      })
      console.log('currentId', currentId)
      console.log('filterCategories', filterCategories)
      return filterCategories
    } catch (error) {
      console.error(error)
      toast.error('Ошибка загрузки категорий', { autoClose: 1000 })
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

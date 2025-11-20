import { useApi } from '@/helpers/useApi'
import { toast } from 'vue3-toastify'

export const useCategoriesLevel = () => {
  const { get } = useApi()
  const getAllCategories = async (currentId) => {
    try {
      const categories = await get('product-groups')
      const filterCategories = categories.filter((cat) => {
        return cat.level !== 2 && cat.parent_id !== Number(currentId) && cat.id !== Number(currentId)
      })
      console.log('currentId', currentId)
      console.log('filterCategories', filterCategories)
    } catch (error) {
      console.error(error)
      toast.error('Ошибка загрузки категорий', { autoClose: 1000 })
    }
  }
  return {
    getAllCategories,
  }
}

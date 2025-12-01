import { useApi } from '@/helpers/useApi'
import { toast } from 'vue3-toastify'

export function productToGroup() {
  const { get, post, delete: deleteApi } = useApi()

  const getAllConnectionsProductToGroup = async (productId) => {
    try {
      console.log('productId', productId)
      const response = await get(`product-to-groups?product_id=${Number(productId)}`)
      return response || []
    } catch (error) {
      console.error('Ошибка загрузки связей товара с категориями:', error)
      toast.error('Не удалось загрузить связи с категориями')
      return []
    }
  }
  const createConnectionsProductToGroup = async (productId, groupId) => {
    try {
      // const response = await get(`product-to-groups`)
      const response = await post('product-to-groups', {
        product_id: Number(productId),
        group_id: Number(groupId),
      })
      toast.success('Категория успешно добавлена')
      return response
    } catch (error) {
      console.error('Ошибка создания связи:', error)
      toast.error('Не удалось добавить категорию')
      throw error
    }
  }

  const deleteConnectionsProductToGroup = async (connectionId) => {
    try {
      await deleteApi(`product-to-groups/${Number(connectionId)}`)
      toast.success('Категория успешно удалена')
    } catch (error) {
      console.error('Ошибка удаления связи:', error)
      toast.error('Не удалось удалить категорию')
      throw error
    }
  }

  return {
    getAllConnectionsProductToGroup,
    createConnectionsProductToGroup,
    deleteConnectionsProductToGroup,
  }
}

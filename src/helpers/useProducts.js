import { useApi } from '@/helpers/useApi'
import { useAttributes } from '@/helpers/useAttributes'

import { ref } from 'vue'

export function useProducts() {
  const { get } = useApi()
  const { loadGroupsAttributes, groupsAttribute } = useAttributes()
  const products = ref([])

  const getAllProducts = async () => {
    let maxPage = 0
    let count = 1

    try {
      const firstResponse = await get(`external-products?page=${count}`, true)

      maxPage = parseInt(firstResponse?.headers['x-pagination-page-count']) || 0

      if (Array.isArray(firstResponse.data)) {
        products.value.push(...firstResponse.data)
      }

      for (count = 2; count <= maxPage; count++) {
        try {
          const response = await get(`external-products?page=${count}`)

          if (Array.isArray(response)) {
            products.value.push(...response)
          }
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Ошибка при загрузке страницы ${count}:`, error)
          continue
        }
      }
    } catch (error) {
      console.error('Ошибка при получении всех товаров:', error)
    }
  }

  const getAllConnectionsAttributesToProduct = async () => {
    await getAllProducts()
    const connections = await get('external-product-to-attributes')
    products.value.forEach((product) => {
      const productConnections = connections.filter()
    })
    console.log('connections', connections)
    return products.value
  }

  const getAllGroupAttributes = async (params) => {}
  const distributiOfAttributesToProducts = () => {}

  return { getAllProducts, products, getAllConnectionsAttributesToProduct }
}

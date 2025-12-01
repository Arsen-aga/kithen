import { useApi } from '@/helpers/useApi'

export function useProducts() {
  const { get } = useApi()

  const getAllProductsToGroup = async (group_id) => {
    let maxPage = 0
    let count = 1
    const products = []

    try {
      const firstResponse = await get(`products?Group=${group_id}&page=${count}`, true)
      console.log('firstResponse', firstResponse)

      maxPage = parseInt(firstResponse?.headers['x-pagination-page-count']) || 0

      if (Array.isArray(firstResponse.data)) {
        products.push(...firstResponse.data)
      }

      for (count = 2; count <= maxPage; count++) {
        try {
          const response = await get(`products?page=${count}`)

          if (Array.isArray(response)) {
            products.push(...response)
          }
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Ошибка при загрузке страницы ${count}:`, error)
          continue
        }
      }
      return products
    } catch (error) {
      console.error('Ошибка при получении всех товаров:', error)
      return products
    }
  }

  const getAllProducts = async () => {
    let maxPage = 0
    let count = 1
    const products = []

    try {
      const firstResponse = await get(`products?page=${count}`, true)

      maxPage = parseInt(firstResponse?.headers['x-pagination-page-count']) || 0

      if (Array.isArray(firstResponse.data)) {
        products.push(...firstResponse.data)
      }

      for (count = 2; count <= maxPage; count++) {
        try {
          const response = await get(`products?page=${count}`)

          if (Array.isArray(response)) {
            products.push(...response)
          }
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Ошибка при загрузке страницы ${count}:`, error)
          continue
        }
      }
      return products
    } catch (error) {
      console.error('Ошибка при получении всех товаров:', error)
      return products
    }
  }

  const getAllConnectionsAttributesToProduct = async (productId) => {
    try {
      const connections = await get('product-to-attributes')
      const attributesConnections = connections.filter((connect) => connect.product_id === productId)
      return attributesConnections
    } catch (error) {
      console.error('Ошибка при получении всех товаров:', error)
    }
  }

  const getAttributes = async (productId) => {
    const connections = await getAllConnectionsAttributesToProduct(productId)
    try {
      const attributePromises = connections.map(async (attrConnect) => {
        const response = await get(`product-attributes/${attrConnect.attribute_id}`)
        return response
      })
      const resAttrs = await Promise.all(attributePromises)
      return resAttrs
    } catch (error) {
      console.log(error)
      return []
    }
  }

  const getAttributeGroup = async (attributeId) => {
    try {
      const attributeGroup = await get(`product-attribute-groups/${attributeId}`)
      return attributeGroup.name
    } catch (error) {
      console.log(error)
      return 'Не известная группа'
    }
  }

  return {
    getAllProducts,
    getAttributes,
    getAttributeGroup,
    getAllProductsToGroup,
  }
}

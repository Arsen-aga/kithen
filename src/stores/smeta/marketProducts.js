import { ref } from 'vue'

export const useMarketProducts = (smeta) => {
  const marketSelectProducts = ref([])
  const selectProducts = ref([])

  const addMarketProduct = (product) => {
    console.log('product', product);
    createCategoryForProducts(product.category)
    const existingCategoryIndex = getExistingCategoryIndex(product.category.id)
    if (existingCategoryIndex !== -1) {
      createProductInCategory(product, existingCategoryIndex)
    }
  }

  const createCategoryForProducts = (category) => {
    const existingCategory = getExistingCategoryIndex(category.id)
    if (existingCategory === -1) {
      marketSelectProducts.value.push({ ...category, products: [] })
    }
  }

  const getExistingCategoryIndex = (categoryId) => {
    return marketSelectProducts.value.findIndex((cat) => cat.id === categoryId)
  }

  const createProductInCategory = (product, categoryIndex) => {
    const currentCat = marketSelectProducts.value[categoryIndex]
    const existingProduct = getExistingProductIndex(product.id, currentCat.products)
    const existingProductInSelectArr = getExistingProductIndex(product.id, selectProducts.value)

    if (existingProduct !== -1) {
      currentCat.products[existingProduct].Count += 1
    } else {
      currentCat.products.push({ ...product, Count: 1 })
    }
    if (existingProductInSelectArr !== -1) {
      selectProducts.value[existingProduct].Count += 1
    } else {
      selectProducts.value.push({ ...product, Count: 1 })
    }
    console.log('selectProducts.value', selectProducts.value)
    smeta.value.Order_ADD = selectProducts.value
  }

  const getExistingProductIndex = (productId, products) => {
    return products.findIndex((p) => p.id === productId)
  }

  const changeProductCount = (productId, count) => {
    const product = getMarketProduct(productId)
    if (product) {
      product.Count = count
      product.price_old = count * product.Price_0
      product.price_new = count * product.Price
    }
  }

  const getMarketProduct = (productId) => {
    for (const category of marketSelectProducts.value) {
      const product = category.products.find((p) => p.id === productId)
      if (product) return product
    }
  }

  const deleteMarketProduct = (productId) => {
    const product = getMarketProduct(productId)
    const productInSelectArr = selectProducts.value.find((p) => p.id === productId)
    if (product) {
      deleteProductInCategory(productId)
      const categoryIndex = getExistingCategoryIndex(product.category.id)

      if (marketSelectProducts.value[categoryIndex]?.products.length === 0) {
        deleteCategory(product.category.id)
      }
    }
    if (productInSelectArr) {
      selectProducts.value = selectProducts.value.filter((p) => p.id !== productId)
      smeta.value.Order_ADD = selectProducts.value
    }
    console.log('selectProducts.value', selectProducts.value)
  }

  const deleteProductInCategory = (productId) => {
    marketSelectProducts.value = marketSelectProducts.value.map((category) => ({
      ...category,
      products: category.products.filter((p) => p.id !== productId),
    }))
  }

  const deleteCategory = (categoryId) => {
    marketSelectProducts.value = marketSelectProducts.value.filter((cat) => cat.id !== categoryId)
  }

  return {
    marketSelectProducts,
    addMarketProduct,
    deleteMarketProduct,
    getMarketProduct,
    changeProductCount,
  }
}

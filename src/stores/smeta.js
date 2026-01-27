import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSmetaStore = defineStore('smeta', () => {
  const smeta = ref()
  const smetaTables = ref()

  // smeta
  const initSmeta = (order) => {
    smeta.value = order
    smetaTables.value = sortSmetaTables(smeta.value.Order_mat)
  }

  const sortSmetaTables = (allElems) => {
    const tables = []
    allElems.forEach((elem) => {
      const existingTable = tables.find((table) => table.id === elem.group_strukt.id)
      if (existingTable) {
        existingTable.table.push(elem)
        existingTable.price += elem.Price || 0
      } else {
        tables.push({
          id: elem.group_strukt.id,
          title: elem.group_strukt.Name,
          price: elem.Price || 0, 
          table: [elem],
        })
      }
    })
    console.log('tables', tables)
    return tables
  }

  // selectProducts
  const marketSelectProducts = ref([])
  const addMarketProduct = (product) => {
    createCategoryForProducts(product.category)
    const existingCategoryIndex = getExistingCategoryIndex(product.category.id)
    if (existingCategoryIndex !== -1) {
      createProductInCategory(product, existingCategoryIndex)
    }
  }
  const createCategoryForProducts = (category) => {
    const existingCategory = getExistingCategoryIndex(category.id)
    if (existingCategory === -1) marketSelectProducts.value.push({ ...category, products: [] })
  }
  const getExistingCategoryIndex = (categoryId) => {
    return marketSelectProducts.value.findIndex((cat) => cat.id === categoryId)
  }
  const createProductInCategory = (product, categoryIndex) => {
    const currentCat = marketSelectProducts.value[categoryIndex]
    const existingProduct = getExistingProductIndex(product.id, currentCat.products)
    if (existingProduct !== -1) {
      currentCat.products[existingProduct].Count += 1
    } else {
      currentCat.products.push({ ...product, Count: 1 })
    }
  }
  const getExistingProductIndex = (productId, currentCat) => {
    return currentCat.findIndex((p) => p.id === productId)
  }
  const changeProductCount = (productId, count) => {
    const product = getMarketProduct(productId)
    product.Count = count
    // console.log('123', 123)
    // if (count < 1) deleteMarketProduct(productId)
  }
  const getMarketProduct = (productId) => {
    for (let index = 0; index < marketSelectProducts.value.length; index++) {
      const product = marketSelectProducts.value[index].products.find((p) => p.id === productId)
      if (product) return product
    }
  }
  const deleteMarketProduct = (productId) => {
    console.log('deleteMarketProduct', productId)
    const product = getMarketProduct(productId)
    deleteProductInCategory(productId)
    const categoryIndex = getExistingCategoryIndex(product.category.id)
    if (marketSelectProducts.value[categoryIndex].products.length >= 1) return
    deleteCategory(product.category.id)
  }
  const deleteProductInCategory = (productId) => {
    for (let index = 0; index < marketSelectProducts.value.length; index++) {
      marketSelectProducts.value[index].products = marketSelectProducts.value[index].products.filter(
        (p) => p.id !== productId
      )
    }
  }
  const deleteCategory = (categoryId) => {
    marketSelectProducts.value = marketSelectProducts.value.filter((cat) => cat.id !== categoryId)
  }

  return {
    smeta,
    initSmeta,
    smetaTables,
    marketSelectProducts,
    addMarketProduct,
    deleteMarketProduct,
    getMarketProduct,
    changeProductCount,
  }
})

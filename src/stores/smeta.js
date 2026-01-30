import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSmetaStore = defineStore('smeta', () => {
  const smeta = ref()
  
  // smeta
  const initSmeta = (order) => {
    smeta.value = order
    smetaTables.value = sortSmetaTables(smeta.value.Order_mat)
  }
  // smetaTables
  const smetaTables = ref()
  const sortSmetaTables = (allElems) => {
    const tables = []
    allElems.forEach((elem) => {
      const existingTable = tables.find((table) => table.id === elem.group_strukt.id)
      if (existingTable) {
        existingTable.table.push(elem)
        existingTable.price += elem.p_sum || 0
      } else {
        tables.push({
          id: elem.group_strukt.id,
          title: elem.group_strukt.Name,
          price: elem.p_sum || 0,
          table: [elem],
        })
      }
    })
    return tables
  }

  const changeElemInSortSmeta = (oldElem, newElem) => {
    if (!oldElem || !newElem || !oldElem.group_strukt || !oldElem.p_id) {
      return
    }
    smetaTables.value = smetaTables.value.map((smetaTable) => {
      if (smetaTable.id !== oldElem.group_strukt.id) {
        return smetaTable
      }
      const elemIndex = smetaTable.table.findIndex((elem) => elem.p_id === oldElem.p_id)
      console.log('elemIndex', elemIndex);
      if (elemIndex === -1) {
        return smetaTable
      }
      const updatedTable = smetaTable.table.map((item, index) => (index === elemIndex ? { ...newElem } : { ...item }))
      const totalPrice = updatedTable.reduce((sum, item) => {
        return sum + (parseFloat(item.p_sum) || 0)
      }, 0)
      return {
        ...smetaTable,
        table: updatedTable,
        price: parseFloat(totalPrice.toFixed(2)),
      }
    })
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
    console.log('product', product);
    product.Count = count
    product.price_old = count * product.Price_0
    product.price_new = count * product.Price
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
    changeElemInSortSmeta,
    marketSelectProducts,
    addMarketProduct,
    deleteMarketProduct,
    getMarketProduct,
    changeProductCount,
  }
})

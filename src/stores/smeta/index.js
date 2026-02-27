import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useSmetaTables } from './smetaTables'
import { useMarketProducts } from './marketProducts'

export const useSmetaStore = defineStore('smeta', () => {
  const smetaOrderOld = ref(null)
  const smetaOrder = ref(null)
  const smeta = ref(null)

  // Подключаем модули
  const smetaTablesModule = useSmetaTables(smeta)
  const marketProductsModule = useMarketProducts(smeta)

  // Основные функции
  const initSmeta = (order) => {
    smetaOrderOld.value = structuredClone(order)
    smetaOrder.value = structuredClone(order)
    smeta.value = JSON.parse(smetaOrder.value.order)
    // console.log('smeta', smeta.value);
    smetaTablesModule.initTables(smeta.value.Order_mat)
  }
  const getResultOrder = () => {
    console.log('smeta', smeta.value);
    console.log('smetaOrder', smetaOrder.value);
    console.log('smetaOrderOld', smetaOrderOld.value);
    smetaOrder.value.order = JSON.stringify(smeta.value)
    return smetaOrder.value
  }

  return {
    // Основные данные
    smeta,
    smetaOrder,
    smetaOrderOld,
    initSmeta,
    getResultOrder,

    // Данные и функции из модуля таблиц
    smetaTables: smetaTablesModule.smetaTables,
    changeElemInSortSmeta: smetaTablesModule.changeElemInSortSmeta,

    // Данные и функции из модуля товаров
    marketSelectProducts: marketProductsModule.marketSelectProducts,
    addMarketProduct: marketProductsModule.addMarketProduct,
    deleteMarketProduct: marketProductsModule.deleteMarketProduct,
    getMarketProduct: marketProductsModule.getMarketProduct,
    changeProductCount: marketProductsModule.changeProductCount,
  }
})

import { ref } from 'vue'

export const useSmetaTables = () => {
  const smetaTables = ref([])

  const sortSmetaTables = (allElems) => {
    const tables = []
    allElems.forEach((elem) => {
      const existingTable = tables.find((table) => table.id === elem.Table)
      if (existingTable) {
        existingTable.table.push(elem)
        existingTable.price += elem.p_sum || 0
      } else {
        tables.push({
          id: elem.Table,
          title: filterTableName(elem.Table) + elem.Table,
          price: elem.p_sum || 0,
          table: [elem],
        })
      }
    })
    return tables
  }

  const filterTableName = (id) => {
    const names = {
      1: 'Корпуса',
      2: 'Фасады',
      3: 'Фурнитура',
      6: 'Заголовок'
    }
    return names[id] || ''
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
      if (elemIndex === -1) return smetaTable
      
      const updatedTable = smetaTable.table.map((item, index) => 
        index === elemIndex ? { ...newElem } : { ...item }
      )
      
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

  const initTables = (orderMat) => {
    smetaTables.value = sortSmetaTables(orderMat)
  }

  return {
    smetaTables,
    initTables,
    changeElemInSortSmeta
  }
}
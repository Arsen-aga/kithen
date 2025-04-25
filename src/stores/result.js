import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useResultItems = defineStore('resultItems', () => {
  const resultItems = ref([
    {
      id: 0,
      title: 'Смета',
      price: 0,
      elems: [],
    },
    {
      id: 1,
      title: 'Товары из маркета',
      price: 0,
      elems: [],
    },
    {
      id: 2,
      title: 'Бытовая техника',
      price: 0,
      elems: [],
    },
    {
      id: 3,
      title: 'Услуги',
      price: 0,
      elems: [],
    },
    {
      id: 4,
      title: 'Срок производства',
      price: 0,
      elems: [],
    },
    {
      id: 5,
      title: 'Выгода',
      price: 0,
      elems: [],
    },
    {
      id: 6,
      title: 'Итого',
      price: 0,
      elems: [],
    },
  ])

  watch(
    () => resultItems,
    (newValue) => {
      let count = 0

      newValue.value.forEach((item) => {
        if (item.id !== 6) {
          count += item.price
        }
      })
      const totalItem = newValue.value.find((item) => item.id === 6)
      if (totalItem) totalItem.price = count
    },
    { deep: true }
  )

  const addPrice = (num, id) => {
    resultItems.value.forEach((item) => {
      if (item.id == id) {
        item.price += num
      }
    })
  }
  const putPrice = (num, id) => {
    resultItems.value.forEach((item) => {
      if (item.id == id) {
        item.price -= num
      }
    })
  }
  return { resultItems, addPrice, putPrice }
})

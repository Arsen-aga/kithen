import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useResultItems = defineStore('resultItems', () => {
  const resultItems = ref([
    {
      id: 0,
      title: 'Смета',
      price: 209762,
      elems: [
        { id: 0, title: 'Корпуса', discount: false, price: 20000 },
        { id: 1, title: 'Фасады', discount: false, price: 20000 },
        { id: 2, title: 'Фурнитура', discount: false, price: 20000 },
        {
          id: 3,
          title: 'Технически сложные изделия',
          discount: false,
          price: 40000,
          items: [
            { id: 0, title: 'Искусственный камень + услуги', price: 20000 },
            { id: 1, title: 'Стеновые панели из стекла + услуги', price: 20000 },
          ],
        },
      ],
    },
    {
      id: 1,
      title: 'Товары из маркета',
      price: 100000,
      elems: [
        { id: 0, title: 'Система хранения', discount: false, price: 10000 },
        { id: 1, title: 'Фурнитура', discount: false, price: 10000 },
      ],
    },
    {
      id: 2,
      title: 'Бытовая техника',
      price: 100000,
      elems: [
        { id: 0, title: 'Холодильник', discount: false, price: 50000 },
        { id: 1, title: 'Посудомоечная машина', discount: false, price: 50000 },
      ],
    },
    {
      id: 3,
      title: 'Услуги',
      price: 36387,
      elems: [
        { id: 0, title: 'Монтаж и доставка кухни', discount: false, price: 20000 },
        { id: 1, title: 'Подключение техники', discount: false, price: 20000 },
      ],
    },
    {
      id: 4,
      title: 'Срок производства',
      days: '10 дней',
      elems: [
        { id: 0, title: 'Производство кухни', days: '10 рабочих дней', discount: false },
        { id: 1, title: 'Искусственный камень', days: '8 рабочих дней', discount: false },
      ],
    },
    {
      id: 5,
      title: 'Выгода',
      price: -36387,
      elems: [
        { id: 0, title: 'Монтаж и доставка кухни', discount: false, price: -10000 },
        { id: 1, title: 'Базовая скидка месяца 5%', discount: false, price: -20000 },
        {
          id: 2,
          title: 'Выгода марта',
          discount: true,
          price: -20000,
          items: [{ id: 0, title: 'Искусственный камень Grandex', price: -10000 }],
          list: [
            { id: 0, title: 'Скидка 30%', price: 0 },
            { id: 1, title: 'Старая цена', price: 30000 },
            { id: 2, title: 'Цена со скидкой', price: 20000 },
            { id: 3, title: 'Выгода', price: 10000 },
          ],
        },
      ],
    },
    {
      id: 6,
      title: 'Итого',
      price: 209762,
    },
  ])

  watch(
    () => resultItems,
    (newValue) => {
      let count = 0

      newValue.value.forEach((item) => {
        if (item.id !== 6 && item.price) {
          count += item.price
          console.log(count)
        }
      })
      const totalItem = newValue.value.find((item) => item.id === 6)
      console.log(totalItem)
      console.log(totalItem.price)
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

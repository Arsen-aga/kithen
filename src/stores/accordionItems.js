import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAccordionItems = defineStore('accordionItems', () => {
  const accordionItems = ref([
    {
      id: 0,
      title: 'Подробная смета',
      items: [
        {
          id: 0,
          title: 'Корпуса',
          table: [
            {
              id: 0,
              title: 'Изготовление четверти радиуса от 150 мм и выше',
              unit: 'шт',
              quantity: 4.0,
              price: 1718.0,
              percent: 5,
            },
            {
              id: 1,
              title: 'Искусственный камень Grandex',
              unit: 'кв.м.',
              quantity: 5.48,
              price: 30012.96,
              percent: 5,
            },
            {
              id: 2,
              title: 'Кромка. торец №2 м=40',
              unit: 'п/м',
              quantity: 1.2,
              price: 1.67,
              percent: 0,
            },
            {
              id: 3,
              title: 'Мойка подстольного монтажа Grandex',
              unit: 'шт',
              quantity: 1.0,
              price: 36088.0,
              percent: 0,
            },
          ],
        },
        {
          id: 1,
          title: 'Фасады',
          table: [],
        },
        {
          id: 2,
          title: 'Фурнитура',
          table: [],
        },
      ],
      link: false,
    },
    {
      id: 1,
      title: 'Маркет',
      info: [],
      link: false,
    },
    {
      id: 2,
      title: 'Бытовая техника',
      info: [],
      link: true,
    },
    {
      id: 3,
      title: 'Выбранные товары',
      info: [],
      link: false,
    },
    {
      id: 4,
      title: 'Технически сложные изделия',
      info: [],
      link: false,
    },
    {
      id: 5,
      title: 'Услуги',
      info: [],
      link: false,
    },
    {
      id: 6,
      title: 'Коммерческое предложение',
      info: [],
      link: false,
    },
  ])

  return { accordionItems }
})

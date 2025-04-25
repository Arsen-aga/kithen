import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSmetaStore = defineStore('smeta', () => {
  const smeta = ref([
    {
      id: 0,
      title: 'Смета',
      price: 0,
      items: [
        {
          id: 0,
          title: 'Корпуса',
          price: 0,
        },
      ],
    },
  ])

  return { smeta }
})

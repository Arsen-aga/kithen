import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useResultItems = defineStore('resultItems', () => {
  const resultItems = ref([
    {
      id: 100,
      title: 'Смета',
      price: 0,
      elems: [
        { id: 110, title: 'Корпуса', discount: false, price: 0 },
        { id: 120, title: 'Фасады', discount: false, price: 0 },
        { id: 130, title: 'Фурнитура', discount: false, price: 0 },
        {
          id: 140,
          title: 'Технически сложные изделия',
          discount: false,
          price: 40000,
          items: [
            { id: 141, title: 'Искусственный камень + услуги', price: 20000 },
            { id: 142, title: 'Стеновые панели из стекла + услуги', price: 20000 },
          ],
        },
      ],
    },
    {
      id: 200,
      title: 'Товары из маркета',
      price: 100000,
      elems: [
        { id: 210, title: 'Система хранения', discount: false, price: 10000 },
        { id: 200, title: 'Фурнитура', discount: false, price: 10000 },
      ],
    },
    {
      id: 300,
      title: 'Бытовая техника',
      price: 100000,
      elems: [
        { id: 310, title: 'Холодильник', discount: false, price: 50000 },
        { id: 320, title: 'Посудомоечная машина', discount: false, price: 50000 },
      ],
    },
    {
      id: 400,
      title: 'Услуги',
      price: 36387,
      elems: [
        { id: 410, title: 'Монтаж и доставка кухни', discount: false, price: 20000 },
        { id: 420, title: 'Подключение техники', discount: false, price: 20000 },
      ],
    },
    {
      id: 500,
      title: 'Срок производства',
      days: '10 дней',
      elems: [
        { id: 510, title: 'Производство кухни', days: '10 рабочих дней', discount: false },
        { id: 520, title: 'Искусственный камень', days: '8 рабочих дней', discount: false },
      ],
    },
    {
      id: 600,
      title: 'Выгода',
      price: -36387,
      elems: [
        { id: 610, title: 'Монтаж и доставка кухни', discount: false, price: -10000 },
        { id: 620, title: 'Базовая скидка месяца 5%', discount: false, price: -20000 },
        {
          id: 630,
          title: 'Выгода марта',
          discount: true,
          price: -20000,
          items: [{ id: 631, title: 'Искусственный камень Grandex', price: -10000 }],
          list: [
            { id: 632, title: 'Скидка 30%', price: 0 },
            { id: 633, title: 'Старая цена', price: 30000 },
            { id: 634, title: 'Цена со скидкой', price: 20000 },
            { id: 635, title: 'Выгода', price: 10000 },
          ],
        },
      ],
    },
    {
      id: 700,
      title: 'Итого',
      price: 209762,
    },
  ])

  /**
   * Рекурсивно вычисляет сумму цен дочерних элементов и обновляет текущий элемент.
   * Поддерживает вложенные массивы elems и items.
   * @param {object} item — элемент, для которого считаем цену.
   * @returns {number} — сумма цен дочерних элементов или собственная цена, если лист.
   */
  const computePrice = (item) => {
    if (!item) return 0
    let sum = 0
    // Если есть вложенные элементы elems — считаем для них цену рекурсивно
    if (item.elems && Array.isArray(item.elems)) {
      item.elems.forEach((child) => {
        sum += computePrice(child)
      })
    }
    // Если есть массив items — считаем для них цену
    if (item.items && Array.isArray(item.items)) {
      item.items.forEach((child) => {
        sum += computePrice(child)
      })
    }
    // Если есть массив products — считаем для них цену
    if (item.products && Array.isArray(item.products)) {
      item.products.forEach((child) => {
        sum += computePrice(child)
      })
    }
    if (item.quantity && item.price) {
      item.sum = item.quantity * item.price
    }
    // Обновляем цену текущего элемента
    item.price = sum || item.price // Если сумма 0, оставляем старую цену
    return item.sum ? item.sum : item.price
  }

  /**
   * Пересчитывает цены для всех главных элементов в корне
   */
  const recomputeAllParents = () => {
    resultItems.value.forEach((item) => {
      computePrice(item)
    })
  }

  watch(
    () => resultItems.value,
    (newValue) => {
      // При любых изменениях пересчитываем цены родителей и сумму "Итого" (id 6)
      recomputeAllParents()
      let total = 0
      newValue.forEach((item) => {
        if (item.id !== 700 && typeof item.price === 'number') {
          total += item.price
        }
      })
      const totalItem = newValue.find((i) => i.id === 700)
      if (totalItem) totalItem.price = total
    },
    { deep: true }
  )

  /**
   * Поиск элемента по id с возвратом пути родителей
   * @param {number} id — id искомого элемента
   * @param {array} items — массив для поиска (по умолчанию корень resultItems)
   * @param {array} parents — массив родителей для накопления (по умолчанию пустой)
   * @returns {object|null} {item, parents} или null если не найден
   */
  const findItemAndParents = (id, items = resultItems.value, parents = []) => {
    for (const item of items) {
      if (item.id === id) {
        return { item, parents }
      }
      if (item.elems) {
        const found = findItemAndParents(id, item.elems, [...parents, item])
        if (found) return found
      }
      if (item.items) {
        const found = findItemAndParents(id, item.items, [...parents, item])
        if (found) return found
      }
      if (item.products) {
        const found = findItemAndParents(id, item.products, [...parents, item])
        if (found) return found
      }
    }
    return null
  }

  /**
   * Увеличивает цену элемента с указанным id на заданное число
   * Обновляет цены всех родителей рекурсивно
   * @param {number} num — число для добавления
   * @param {number} id — id дочернего элемента
   */
  const addPrice = (num, id) => {
    const found = findItemAndParents(id)
    if (found) {
      found.item.price += num
      // Обновляем цены родителей начиная с ближайшего
      for (let i = found.parents.length - 1; i >= 0; i--) {
        computePrice(found.parents[i])
      }
    }
  }

  /**
   * Уменьшает цену элемента с указанным id на заданное число
   * Обновляет цены всех родителей рекурсивно
   * @param {number} num — число для вычитания
   * @param {number} id — id дочернего элемента
   */
  const putPrice = (num, id) => {
    const found = findItemAndParents(id)
    if (found) {
      found.item.price -= num
      for (let i = found.parents.length - 1; i >= 0; i--) {
        computePrice(found.parents[i])
      }
    }
  }

  const addItem = (parentId, newItem) => {
    const found = findItemAndParents(parentId)
    if (found) {
      // Добавляем новый элемент в соответствующий массив
      if (found.item.elems) {
        found.item.elems.push(newItem)
      } else if (found.item.items) {
        found.item.items.push(newItem)
      } else {
        found.item.products ? found.item.products.push(newItem) : (found.item.products = [newItem])
      }
      // Пересчитываем цены
      recomputeAllParents() // Обновляем цены для всех элементов
    }
  }

  return { resultItems, addPrice, putPrice, addItem, findItemAndParents }
})

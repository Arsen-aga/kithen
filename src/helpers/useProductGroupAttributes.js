import { ref } from 'vue'
import { useApi } from './useApi'

export function useProductGroupAttributes () {
  const { get, post, patch, delete: deleteApi } = useApi()
  const categoryAttributeGroups = ref([])
  const allCategories = ref([])

  // Загрузка всех связей категорий с группами атрибутов
  const loadCategoryAttributeGroups = async () => {
    try {
      categoryAttributeGroups.value = (await get('category-to-attributes')) || []
      console.log('Загруженные связи категорий с группами атрибутов:', categoryAttributeGroups.value)
    } catch (error) {
      console.error('Ошибка загрузки связей категорий с группами атрибутов:', error)
    }
  }

  // Загрузка всех категорий
  const loadAllCategories = async () => {
    try {
      allCategories.value = (await get('product-groups')) || []
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error)
    }
  }

  // Получение групп атрибутов родительской категории (рекурсивно)
  const getParentAttributeGroups = (categoryId) => {
    const result = new Map()

    const findParentGroups = (currentCategoryId) => {
      const currentCategory = allCategories.value.find((cat) => cat.id === currentCategoryId)
      if (!currentCategory) return

      // Если у категории есть родитель, получаем его группы
      if (currentCategory.parent_id) {
        const parentGroups = getCategoryAttributeGroups(currentCategory.parent_id)

        // Добавляем группы родителя (если они еще не добавлены)
        parentGroups.forEach((group) => {
          if (!result.has(group.external_attribute_group_id)) {
            result.set(group.external_attribute_group_id, {
              group_id: group.external_attribute_group_id,
              require: group.require === 1,
              inherited: true, // Помечаем как унаследованные
            })
          }
        })

        // Рекурсивно ищем группы у родителей выше
        findParentGroups(currentCategory.parent_id)
      }
    }

    findParentGroups(categoryId)
    return Array.from(result.values())
  }

  // Получение всех групп атрибутов для категории (собственные + унаследованные)
  const getAllAttributeGroupsForCategory = (categoryId) => {
    const ownGroups = getCategoryAttributeGroups(categoryId).map((group) => ({
      group_id: group.external_attribute_group_id,
      require: group.require === 1,
      inherited: false,
    }))

    const inheritedGroups = getParentAttributeGroups(categoryId)

    return [...ownGroups, ...inheritedGroups]
  }

  // Получение связей для конкретной категории
  const getCategoryAttributeGroups = (categoryId) => {
    return categoryAttributeGroups.value.filter((link) => link.external_category_id === categoryId)
  }

  // Создание связи
  const createCategoryAttributeLink = async (data) => {
    try {
      const formData = new FormData()
      formData.append('category_id', data.external_category_id)
      formData.append('attribute_group_id', data.external_attribute_group_id)
      formData.append('require', data.require ? 1 : 0)

      const response = await post('category-to-attributes', formData, 'multipart/form-data')

      // Обновляем локальное состояние
      categoryAttributeGroups.value.push(response)

      return response
    } catch (error) {
      console.error('Ошибка создания связи:', error)
      throw error
    }
  }

  // Обновление связи
  const updateCategoryAttributeLink = async (id, data) => {
    try {
      const formData = new FormData()
      formData.append('category_id', data.external_category_id)
      formData.append('attribute_group_id', data.external_attribute_group_id)
      formData.append('require', data.require ? 1 : 0)

      const response = await patch(`category-to-attributes/${id}`, formData, 'multipart/form-data')

      // Обновляем локальное состояние
      const index = categoryAttributeGroups.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        categoryAttributeGroups.value[index] = response
      }

      return response
    } catch (error) {
      console.error('Ошибка обновления связи:', error)
      throw error
    }
  }

  // Удаление связи
  const deleteCategoryAttributeLink = async (id) => {
    try {
      await deleteApi(`category-to-attributes/${id}`)

      // Обновляем локальное состояние
      categoryAttributeGroups.value = categoryAttributeGroups.value.filter((item) => item.id !== id)
    } catch (error) {
      console.error('Ошибка удаления связи:', error)
      throw error
    }
  }

  // Получение дочерних категорий (рекурсивно)
  const getChildCategories = (parentId) => {
    const result = []

    const findChildren = (categoryId) => {
      const children = allCategories.value.filter((cat) => cat.parent_id === categoryId)
      children.forEach((child) => {
        result.push(child.id)
        findChildren(child.id)
      })
    }

    findChildren(parentId)
    return result
  }

  // Добавление связи ко всем дочерним категориям
  const addAttributeGroupToChildren = async (parentCategoryId, attributeGroupId, require) => {
    const childCategoryIds = getChildCategories(parentCategoryId)

    for (const childCategoryId of childCategoryIds) {
      // Проверяем, нет ли уже такой связи у дочерней категории
      const existingLink = categoryAttributeGroups.value.find(
        (link) => link.external_category_id === childCategoryId && link.external_attribute_group_id === attributeGroupId
      )

      if (!existingLink) {
        await createCategoryAttributeLink({
          external_category_id: childCategoryId,
          external_attribute_group_id: attributeGroupId,
          require: require,
        })
      }
    }
  }

  // Удаление связи со всех дочерних категорий
  const removeAttributeGroupFromChildren = async (parentCategoryId, attributeGroupId) => {
    const childCategoryIds = getChildCategories(parentCategoryId)

    for (const childCategoryId of childCategoryIds) {
      const link = categoryAttributeGroups.value.find(
        (item) => item.external_category_id === childCategoryId && item.external_attribute_group_id === attributeGroupId
      )

      if (link) {
        await deleteCategoryAttributeLink(link.id)
      }
    }
  }

  return {
    categoryAttributeGroups,
    allCategories,
    loadCategoryAttributeGroups,
    loadAllCategories,
    getCategoryAttributeGroups,
    createCategoryAttributeLink,
    updateCategoryAttributeLink,
    deleteCategoryAttributeLink,
    addAttributeGroupToChildren,
    removeAttributeGroupFromChildren,
    getChildCategories,
    getParentAttributeGroups,
    getAllAttributeGroupsForCategory,
  }
}

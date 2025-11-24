import { ref } from 'vue'
import { useApi } from './useApi'
import { useCategoriesLevel } from './useCategoriesLevel'
import { toast } from 'vue3-toastify'

export function useAttributes() {
  const { get, post, patch, delete: deleteApi } = useApi()
  const { getCategoryInId } = useCategoriesLevel()

  const attributes = ref([])
  const groupsAttribute = ref([])
  const filteredAttributes = ref([])
  const attributesLoaded = ref(false)
  const selectedAttributes = ref([])

  const getAllAttributes = async (searchQuery, page = 1) => {
    let url = `product-attributes?page=${page}`
    if (searchQuery) {
      url += `&name=${encodeURIComponent(searchQuery)}`
    }
    try {
      const newAttributes = await get(url)
      attributes.value = newAttributes || []
      console.log('newAttributes', newAttributes)
      attributesLoaded.value = true
      return newAttributes && newAttributes.length > 0 ? newAttributes : []
    } catch (error) {
      console.error('Ошибка загрузки атрибутов:', error)
      attributesLoaded.value = true
      return []
    }
  }

  const loadGroupsAttributes = async () => {
    try {
      groupsAttribute.value = await get('product-attribute-groups')
    } catch (error) {
      console.error('Ошибка загрузки групп атрибутов:', error)
    }
  }

  const getAllGroupsAttribute = async (searchQuery, page = 1) => {
    let url = `product-attribute-groups?page=${page}`
    if (searchQuery) {
      url += `&name=${encodeURIComponent(searchQuery)}`
    }

    try {
      const newGroupsAttribute = await get(url)
      return newGroupsAttribute && newGroupsAttribute.length > 0 ? newGroupsAttribute : []
    } catch (error) {
      console.error(error)
      toast.error('Ошибка загрузки категорий', { autoClose: 1000 })
      return []
    }
  }

  const getCategoryAttributeGroups = async (categoryId) => {
    if (!categoryId) return []

    try {
      const relations = await get(`category-to-attributes?category_id=${categoryId}`)
      return relations || []
    } catch (error) {
      console.error('Ошибка загрузки групп атрибутов категории:', error)
      return []
    }
  }

  const createAttributeGroup = async (name) => {
    try {
      const newGroup = await post('product-attribute-groups', {
        name: name.trim(),
      })
      toast.success('Группа атрибутов успешно создана', { autoClose: 1000 })
      return newGroup
    } catch (error) {
      console.error('Ошибка создания группы атрибутов:', error)
      toast.error('Ошибка создания группы атрибутов', { autoClose: 1000 })
      throw error
    }
  }

  const createAttribute = async (name, groupId) => {
    try {
      const newAttribute = await post('product-attributes', {
        name: name.trim(),
        group_id: groupId,
      })
      toast.success('Атрибут успешно создан', { autoClose: 1000 })
      return newAttribute
    } catch (error) {
      console.error('Ошибка создания атрибута:', error)
      toast.error('Ошибка создания атрибута', { autoClose: 1000 })
      throw error
    }
  }

  const addGroupToCategory = async (categoryId, groupId, require = false) => {
    try {
      return await post('category-to-attributes', {
        category_id: categoryId,
        attribute_group_id: groupId,
        require: require ? 1 : 0,
      })
    } catch (error) {
      console.error('Ошибка добавления группы к категории:', error)
      throw error
    }
  }

  const updateGroupRequire = async (relationId, require) => {
    try {
      return await patch('category-to-attributes/' + relationId, {
        require: require ? 1 : 0,
      })
    } catch (error) {
      console.error('Ошибка обновления обязательности группы:', error)
      throw error
    }
  }

  const removeGroupFromCategory = async (relationId) => {
    try {
      await deleteApi('category-to-attributes/' + relationId)
    } catch (error) {
      console.error('Ошибка удаления группы из категории:', error)
      throw error
    }
  }

  const saveCategoryAttributeGroups = async (categoryId, groupsData) => {
    if (!categoryId) throw new Error('ID категории не указан')

    try {
      // Получаем текущие связи
      const currentRelations = await getCategoryAttributeGroups(categoryId)

      // Обрабатываем добавленные группы
      const addedGroups = groupsData.filter(
        (group) => !currentRelations.some((rel) => rel.attribute_group_id === group.attribute_group_id)
      )

      // Обрабатываем удаленные группы
      const removedGroups = currentRelations.filter(
        (rel) => !groupsData.some((group) => group.attribute_group_id === rel.attribute_group_id)
      )

      // Обрабатываем измененные группы
      const updatedGroups = groupsData.filter((group) => {
        const currentRel = currentRelations.find((rel) => rel.attribute_group_id === group.attribute_group_id)
        return currentRel && currentRel.require !== group.require
      })

      // Выполняем операции
      const addPromises = addedGroups.map((group) =>
        addGroupToCategory(categoryId, group.attribute_group_id, group.require)
      )

      const removePromises = removedGroups.map((rel) => removeGroupFromCategory(rel.id))

      const updatePromises = updatedGroups.map((group) => {
        const currentRel = currentRelations.find((rel) => rel.attribute_group_id === group.attribute_group_id)
        console.log('currentRel', currentRel)
        return updateGroupRequire(currentRel.id, group.require)
      })

      await Promise.all([...addPromises, ...removePromises, ...updatePromises])

      return true
    } catch (error) {
      console.error('Ошибка сохранения групп атрибутов категории:', error)
      throw error
    }
  }

  const filterAttributesByGroup = (groupId) => {
    filteredAttributes.value = groupId ? attributes.value.filter((attr) => attr.group_id === groupId) : []
  }

  const getAttributeName = (attributeId) => {
    if (!attributesLoaded.value) return 'Загрузка...'
    const attribute = attributes.value.find((attr) => attr.id === attributeId)
    return attribute?.Name || attribute?.name || `Атрибут #${attributeId}`
  }
  const getGroupAttribute = async (groupAttributeId) => {
    if (!groupAttributeId) return
    try {
      const groupAttribute = get(`product-attribute-groups/${groupAttributeId}`)
      return groupAttribute
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const productToAttributes = async (productId, attributes) => {
    if (!productId) throw new Error('ID товара не найден')
    console.log('сохранение атрибутов', attributes)

    const results = []
    for (const attribute of attributes) {
      const formData = new FormData()
      formData.append('product_id', productId)
      formData.append('attribute_id', attribute.id)

      try {
        const result = await post('product-to-attributes', formData, 'multipart/form-data')
        results.push(result)
      } catch (error) {
        console.error(`Ошибка связи атрибута ${attribute} с товаром:`, error)
      }
    }
    return results
  }

  const removeAttributeFromProduct = async (productId, attributeId) => {
    console.log('удалили атрибут', productId, attributeId)
    try {
      const connection = await get(`product-to-attributes?product_id=${productId}`)
      for (const elem of connection) {
        if (elem.attribute_id === attributeId) {
          await deleteApi(`product-to-attributes/${elem.id}`)
        }
      }
      toast.success('Атрибут удален из товара', { autoClose: 1000 })
    } catch (error) {
      console.error('Ошибка удаления связи атрибута:', error)
      toast.error('Ошибка удаления атрибута', { autoClose: 1000 })
    }
  }

  const searchAllRequiredGroupsInCategoryLevel = async (currentCat) => {
    const allGroups = []
    const categoryIds = []
    console.log('currentCat', currentCat)

    try {
      // Собираем ID всех категорий в цепочке
      let category = currentCat
      while (category) {
        categoryIds.push(category.id)
        category = category.parent_id ? await getCategoryInId(category.parent_id) : null
      }

      // Параллельно загружаем группы для всех категорий
      const groupPromises = categoryIds.map((categoryId) => get(`category-to-attributes?category_id=${categoryId}`))

      const groupsResults = await Promise.all(groupPromises)

      // Объединяем результаты
      groupsResults.forEach((groups, index) => {
        if (groups && groups.length > 0) {
          const categoryId = categoryIds[index]
          const groupsWithInfo = groups.map((group) => ({
            ...group,
            parent_group: index > 0, // true для родительских категорий
            level: index,
            category_id: categoryId,
          }))
          allGroups.push(...groupsWithInfo)
        }
      })

      return allGroups
    } catch (error) {
      console.error('Ошибка получения групп атрибутов:', error)
      return []
    }
  }

  return {
    attributes,
    groupsAttribute,
    filteredAttributes,
    attributesLoaded,
    selectedAttributes,
    getAllAttributes,
    loadGroupsAttributes,
    getAllGroupsAttribute,
    getCategoryAttributeGroups,
    createAttributeGroup,
    createAttribute,
    addGroupToCategory,
    updateGroupRequire,
    removeGroupFromCategory,
    saveCategoryAttributeGroups,
    filterAttributesByGroup,
    getAttributeName,
    getGroupAttribute,
    productToAttributes,
    removeAttributeFromProduct,
    searchAllRequiredGroupsInCategoryLevel,
  }
}

import { ref } from 'vue'
import { useApi } from './useApi'

export function useAttributes() {
  const { get, post, delete: deleteApi } = useApi()

  const attributes = ref([])
  const groupsAttribute = ref([])
  const filteredAttributes = ref([])
  const attributesLoaded = ref(false)
  const selectedAttributes = ref([])

  const loadAttributes = async () => {
    try {
      attributes.value = (await get('product-attributes')) || []
      attributesLoaded.value = true
    } catch (error) {
      console.error('Ошибка загрузки атрибутов:', error)
      attributesLoaded.value = true
    }
  }

  const loadGroupsAttributes = async () => {
    try {
      console.log('sdjfnsd');

      groupsAttribute.value = (await get('product-attribute-groups'))
    } catch (error) {
      console.error('Ошибка загрузки групп атрибутов:', error)
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

  const productToAttributes = async (productId, attributes) => {
    if (!productId) throw new Error('ID товара не найден')
    console.log('сохранение атрибутов', attributes)

    const results = []
    for (const attribute of attributes) {
      const formData = new FormData()
      formData.append('product_id', productId)
      formData.append('attribute_id', attribute)

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
      const connection = await get('product-to-attributes')
      console.log('connection', connection)
      const foundConnection = connection?.find(
        (item) => item.product_id === productId && item.attribute_id === attributeId
      )
      console.log('foundConnection', foundConnection)
      if (foundConnection) {
        console.log('удаляемый атрибут', foundConnection)
        await deleteApi(`product-to-attributes/${foundConnection.id}`)
      }
    } catch (error) {
      console.error('Ошибка удаления связи атрибута:', error)
    }
  }

  return {
    attributes,
    groupsAttribute,
    filteredAttributes,
    attributesLoaded,
    selectedAttributes,
    loadAttributes,
    loadGroupsAttributes,
    filterAttributesByGroup,
    getAttributeName,
    productToAttributes,
    removeAttributeFromProduct,
  }
}

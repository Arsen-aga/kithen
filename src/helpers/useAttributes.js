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
      attributes.value = (await get('external-product-attributes')) || []

      console.log('Получаю все атрибуты', attributes.value)
      attributesLoaded.value = true
    } catch (error) {
      console.error('Ошибка загрузки атрибутов:', error)
      attributesLoaded.value = true
    }
  }

  const loadGroupsAttributes = async () => {
    try {
      groupsAttribute.value = (await get('external-product-attribute-groups')) || []
    } catch (error) {
      console.error('Ошибка загрузки групп атрибутов:', error)
    }
  }

  const filterAttributesByGroup = (groupId) => {
    filteredAttributes.value = groupId ? attributes.value.filter((attr) => attr.group_id === groupId) : []
  }

  const getAttributeName = (attributeId) => {
    console.log('attributeId', attributeId)
    if (!attributesLoaded.value) return 'Загрузка...'
    const attribute = attributes.value.find((attr) => attr.id === attributeId)
    return attribute?.Name || attribute?.name || attribute?.attribute_value || `Атрибут #${attributeId}`
  }

  const productToAttributes = async (productId, attributes) => {
    if (!productId) throw new Error('ID товара не найден')

    const results = []
    for (const attribute of attributes) {
      const formData = new FormData()
      formData.append('product_id', productId)
      formData.append('attribute_id', attribute.id)

      try {
        const result = await post('external-product-to-attributes', formData, 'multipart/form-data')
        results.push(result)
      } catch (error) {
        console.error(`Ошибка связи атрибута ${attribute.id} с товаром:`, error)
      }
    }
    return results
  }

  const productToAttribute = async (productId, attributeId) => {
    if (!productId) throw new Error('ID товара не найден')
    if (!attributeId) throw new Error('ID атрибута не найден')
    console.log('productId', productId)
    console.log('attributeId', attributeId)
    const formData = new FormData()
    formData.append('product_id', productId)
    formData.append('attribute_id', attributeId)

    try {
      const response = await post('external-product-to-attributes', formData, 'multipart/form-data')
      return response
    } catch (error) {
      console.error('Ошибка удаления связи атрибута:', error)
    }
  }
  const removeAttributeFromProduct = async (productId, attribute) => {
    let idAttribute
    if (typeof attribute === 'number') {
      idAttribute = attribute
    } else {
      idAttribute = attribute.attribute_id || attribute.id
    }
    console.log('удалили атрибут', productId, idAttribute)
    try {
      const connection = await get('external-product-to-attributes')
      console.log('connection', connection)
      const foundConnection = connection?.find(
        (item) => item.product_id === productId && item.attribute_id === idAttribute
      )
      console.log('foundConnection', foundConnection)
      if (foundConnection) {
        console.log('удаляемый атрибут', foundConnection)
        await deleteApi(`external-product-to-attributes/${foundConnection.id}`)
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
    productToAttribute,
    removeAttributeFromProduct,
  }
}

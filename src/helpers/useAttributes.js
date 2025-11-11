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

  const filterAttributesByGroup = (groupId, returnAttributes = false) => {
    console.log('groupId', groupId)
    console.log('attributes', attributes)
    const filterAttrs = groupId ? attributes.value.filter((attr) => attr.group_id === groupId) : []
    if (returnAttributes) return filterAttrs
    else filteredAttributes.value = filterAttrs
  }

  const getAttributeNameOne = async (attributeId) => {
    try {
      const attribute = await get(`external-product-attributes/${attributeId}`)
      console.log('Получаю атрибут', attribute)
      return attribute?.attribute_value
    } catch (error) {
      console.error('Ошибка загрузки атрибутов:', error)
    }
  }

  const getAttributeName = (attributeId) => {
    console.log('attributeId', attributeId)
    if (!attributesLoaded.value) return 'Загрузка...'
    console.log('attributes.value', attributes.value)
    const attribute = attributes.value.find((attr) => attr.id === Number(attributeId))
    return attribute?.Name || attribute?.name || attribute?.attribute_value || `Атрибут #${attributeId}`
  }

  const productToAttributes = async (productId, attributes) => {
    console.log('attributes', attributes)
    if (!productId) throw new Error('ID товара не найден')

    const results = []
    for (const attribute of attributes) {
      console.log('attribute', attribute)
      const formData = new FormData()
      formData.append('product_id', productId)
      formData.append('attribute_id', Number(attribute.id))

      console.log('formData', formData)
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
    } else if (typeof attribute === 'object' && attribute.id) {
      idAttribute = attribute.id
    } else {
      idAttribute = attribute.attribute_id || attribute.id
    }

    console.log('удалили атрибут', productId, idAttribute)
    try {
      const connection = await get('external-product-to-attributes')
      console.log('Все связи:', connection)
      const foundConnection = connection?.find(
        (item) => item.product_id === productId && item.attribute_id === Number(idAttribute)
      )
      console.log('Найденная связь для удаления', foundConnection)
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
    getAttributeNameOne,
    productToAttributes,
    productToAttribute,
    removeAttributeFromProduct,
  }
}

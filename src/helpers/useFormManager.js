import { ref } from 'vue'
import { useApi } from './useApi'

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export function useFormManager(entityType, routeParams) {
  const { post, patch } = useApi()

  const createFormData = () => ({
    type: entityType,
    title: '',
    video: null,
    attributes: [],
    images: [],
    description: '',
    sort: 0,
    image: null,
    groupProduct: '',
    groupAttribute: '',
    product_id: '',
    parent_id: null,
    level: 0,
  })

  const formData = ref(createFormData())
  const currentItem = ref(null)

  const entityConfigs = {
    'external-products': {
      fields: ['title', 'description', 'category_id', 'uid', 'price'],
      createData: (data) => ({
        title: data.title,
        description: String(data.description),
        short_description: String(data.description),
        category_id: data.groupProduct,
        uid: generateTempId(),
        price: data.price,
      }),
      updateData: (data, current) => ({
        ...current,
        title: data.title,
        description: String(data.description),
        short_description: String(data.short_description),
        category_id: data.groupProduct,
        price: data.price,
      }),
    },
    'external-categories': {
      fields: ['title', 'image', 'sort', 'uid', 'parent_id', 'level'],
      createData: (data) => {
        let localImage
        if (data.image && data.image.length) {
          localImage = data.image[0]?.url
        } else {
          localImage = null
        }
        const res = {
          title: data.title,
          uid: generateTempId(),
          sort_order: data.sort,
          parent_id: data.parent_id,
          level: data.level,
          image: localImage,
        }
        return res
      },
      updateData: (data, current) => {
        let localImage
        if (data.image && data.image.length) {
          localImage = data.image[0]?.url
        } else {
          localImage = null
        }
        const res = {
          ...current,
          title: data.title,
          sort_order: data.sort,
          parent_id: data.parent_id,
          level: data.level,
          image: localImage,
        }
        return res
      },
    },
    'external-product-attribute-groups': {
      fields: ['name'],
      createData: (data) => ({ name: data.title }),
      updateData: (data, current) => ({ ...current, name: data.title }),
    },
    'external-product-attributes': {
      fields: ['attribute_value', 'group_id', 'product_id'],
      createData: (data) => ({
        attribute_value: data.title,
        group_id: data.groupAttribute,
        product_id: data.product_id,
      }),
      updateData: (data, current) => ({
        ...current,
        attribute_value: data.title,
        group_id: data.groupAttribute,
        product_id: data.product_id,
      }),
    },
  }

  const getEndpoint = (isNew = false) => {
    const config = entityConfigs[entityType]
    if (!config) throw new Error(`Unknown entity type: ${entityType}`)

    return isNew ? entityType : `${entityType}/${routeParams.id.value}`
  }

  const createItem = async () => {
    const config = entityConfigs[entityType]
    const newData = config.createData(formData.value)
    console.log(entityType)
    console.log(newData)
    if (formData.value.parent_id) {
      console.log('есть родительская категория')
      formData.value.level = 1
    }
    return await post(entityType, newData)
  }

  const updateItem = async () => {
    const config = entityConfigs[entityType]
    console.log('formData.value', formData.value)
    console.log('currentItem.value', currentItem.value)
    if (formData.value.parent_id) {
      console.log('есть родительская категория')
      formData.value.level = 1
    }
    const updateData = config.updateData(formData.value, currentItem.value)
    return await patch(getEndpoint(), updateData)
  }

  const resetForm = () => {
    formData.value = createFormData()
    currentItem.value = null
  }

  const initializeFormData = (itemData) => {
    if (!itemData) {
      resetForm()
      return
    }
    const commonFields = {
      title: itemData.Name || itemData.name || itemData.title || itemData.attribute_value || '',
      description: itemData.description || '',
      short_description: itemData.short_description || '',
      groupProduct: itemData.Group || itemData.category_id || null,
      groupAttribute: itemData.group_id || null,
      sort: itemData.sort_order || 0,
      image: itemData.image || null,
      price: itemData.price || null,
      id: itemData.id || null,
      parent_id: itemData.parent_id || null,
      level: itemData.level || null,
    }

    console.log('commonFields', commonFields)

    formData.value = { ...formData.value, ...commonFields }
    currentItem.value = itemData
  }

  return {
    formData,
    currentItem,
    createItem,
    updateItem,
    resetForm,
    initializeFormData,
    entityConfigs,
  }
}

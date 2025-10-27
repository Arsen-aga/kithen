import { ref } from 'vue'
import { useApi } from './useApi'

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export function useFormManager(entityType, routeParams) {
  const { post, patch } = useApi()

  const createFormData = () => ({
    type: entityType,
    title: '',
    video: null,
    attrs: [],
    images: [],
    description: '',
    sort: 0,
    photo: null,
    groupProduct: '',
    groupAttribute: '',
  })

  const formData = ref(createFormData())
  const currentItem = ref(null)

  const entityConfigs = {
    'external-products': {
      fields: ['title', 'description', 'category_id', 'attrs', 'uid', 'price'],
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
        attrs: data.attrs,
        price: data.price,
      }),
    },
    'external-categories': {
      fields: ['title', 'photo', 'sort', 'uid'],
      createData: (data) => ({
        title: data.title,
        uid: generateTempId(),
        sort_order: data.sort,
      }),
      updateData: (data, current) => {
        const res = {
          ...current,
          title: data.title,
          sort_order: data.sort,
          photo: data.photo[0],
        }
        return res
      },
    },
    'product-attribute-groups': {
      fields: ['name'],
      createData: (data) => ({ name: data.title }),
      updateData: (data, current) => ({ ...current, name: data.title }),
    },
    'product-attributes': {
      fields: ['name', 'group_id'],
      createData: (data) => ({
        name: data.title,
        group_id: data.groupAttribute,
      }),
      updateData: (data, current) => ({
        ...current,
        name: data.title,
        group_id: data.groupAttribute,
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
    console.log('config', config)
    console.log('formData.value', formData.value)
    const newData = config.createData(formData.value)
    console.log('newData', newData)
    return await post(entityType, newData)
  }

  const updateItem = async () => {
    const config = entityConfigs[entityType]
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
      title: itemData.Name || itemData.name || itemData.title || '',
      description: itemData.description || '',
      short_description: itemData.short_description || '',
      groupProduct: itemData.Group || itemData.category_id || null,
      groupAttribute: itemData.group_id || null,
      sort: itemData.sort_order || 0,
      photo: itemData.photo || null,
      price: itemData.price || null,
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

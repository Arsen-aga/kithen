import { ref } from 'vue'
import { useApi } from './useApi'

export function useFormManager(entityType, routeParams) {
  const { post, patch } = useApi()

  const createFormData = () => ({
    type: entityType,
    title: '',
    video: null,
    attrs: [],
    images: [],
    description: '',
    groupProduct: '',
    groupAttribute: '',
    sort: 0,
    photo: null,
    parent_id: null,
    level: 0,
  })

  const formData = ref(createFormData())
  const currentItem = ref(null)

  const entityConfigs = {
    products: {
      fields: ['Name', 'description', 'Group', 'attrs'],
      createData: (data) => ({
        Name: data.title,
        description: String(data.description),
        Group: data.groupProduct,
      }),
      updateData: (data, current) => ({
        ...current,
        Name: data.title,
        description: String(data.description),
        Group: data.groupProduct,
        attrs: data.attrs,
      }),
    },
    'product-groups': {
      fields: ['Name', 'photo', 'sort', 'parent_id', 'level'],
      createData: (data) => {
        let localImage
        if (data.photo && data.photo.length) {
          localImage = data.photo[0]?.url
        } else {
          localImage = null
        }
        return {
          Name: data.title,
          photo: localImage,
          sort: data.sort,
          parent_id: data.parent_id,
          level: data.level,
        }
      },
      updateData: (data, current) => {
        console.log('data', data)
        console.log('current', current)
        let localImage
        if (data.photo && data.photo.length) {
          localImage = data.photo[0]?.url
        } else {
          localImage = null
        }
        const res = {
          ...current,
          Name: data.title,
          photo: localImage,
          sort: data.sort,
          parent_id: data.parent_id,
          level: data.level,
        }
        console.log(res)
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
    const newData = config.createData(formData.value)
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
    console.log('initializeFormData', itemData)

    const commonFields = {
      title: itemData.Name || itemData.name || '',
      description: itemData.description || '',
      groupProduct: itemData.Group || null,
      groupAttribute: itemData.group_id || null,
      sort: itemData.sort || 0,
      photo: itemData.photo || null,
      parent_id: itemData.parent_id || null,
      level: itemData.level || 0,
    }

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

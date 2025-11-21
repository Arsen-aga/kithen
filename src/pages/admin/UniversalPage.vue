<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

// helpers
import { useFormManager } from '@/helpers/useFormManager'
import { useAttributes } from '@/helpers/useAttributes'
import { useFileManager } from '@/helpers/useFileManager'
import { useApi } from '@/helpers/useApi'
import { useProductGroupAttributes } from '@/helpers/useProductGroupAttributes'

// Components
import BackButton from '@/components/UI/BackButton.vue'
import ProductsEditor from '@/components/Editors/ProductsEditor.vue'
import AttributeEditor from '@/components/Editors/AttributeEditor.vue'
import GenericEditor from '@/components/Editors/GenericEditor.vue'

// Константы
const ENTITY_TYPES = {
  PRODUCTS: 'products',
  CATEGORIES: 'product-groups',
  ATTRIBUTES: 'product-attributes',
  ATTRIBUTE_GROUPS: 'product-attribute-groups',
}

const FILE_TYPES = {
  PHOTO: 'photo',
  VIDEO: 'video',
}

// Composables
const route = useRoute()
const router = useRouter()
const { del, get, post } = useApi()

// Реактивные данные
const routeParamName = computed(() => route.params.name)
const id = computed(() => route.params.id)

const files = ref([])
const groupsProduct = ref([])
const categoriesList = ref([])
const categoryAttributeGroupsForProduct = ref([])
const attributesByGroup = ref({})
const loadingAttributes = ref({})
const additionalAttributes = ref([])
const categoryAttributeLinks = ref([])
const selectedAttributeGroups = ref([])

// Инициализация хелперсов
const { formData, currentItem, createItem, updateItem, resetForm, initializeFormData } = useFormManager(routeParamName.value, {
  id,
})
const {
  groupsAttribute,
  selectedAttributes,
  loadAttributes,
  loadGroupsAttributes,
  filterAttributesByGroup,
  getAttributeName,
  productToAttributes,
  productToAttribute,
  removeAttributeFromProduct,
} = useAttributes()
const {
  imagesSrc,
  videoSrc,
  initFiles,
  productToFile,
  handleFileRemove,
  uploadFile,
  uploadMultipleFiles,
  deleteMarkedFiles,
  clearFilesToDelete,
  deleteCategoryImage,
} = useFileManager()
const {
  loadCategoryAttributeGroups,
  loadAllCategories,
  getCategoryAttributeGroups,
  createCategoryAttributeLink,
  updateCategoryAttributeLink,
  deleteCategoryAttributeLink,
  addAttributeGroupToChildren,
  removeAttributeGroupFromChildren,
  getAllAttributeGroupsForCategory,
  getParentAttributeGroups,
} = useProductGroupAttributes()

// Computed свойства
const isProducts = computed(() => routeParamName.value === ENTITY_TYPES.PRODUCTS)
const isCategories = computed(() => routeParamName.value === ENTITY_TYPES.CATEGORIES)
const isAttributes = computed(() => routeParamName.value === ENTITY_TYPES.ATTRIBUTES)
const isAttributeGroups = computed(() => routeParamName.value === ENTITY_TYPES.ATTRIBUTE_GROUPS)
const isNewItem = computed(() => id.value === 'new')

// Основные методы
const loadItemData = async () => {
  if (isNewItem.value) {
    resetForm()
    selectedAttributes.value = []
    return
  }

  try {
    const response = await get(`${routeParamName.value}/${id.value}`)
    currentItem.value = response
    await initializeEditorData()
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  }
}

const initializeEditorData = async () => {
  const itemData = currentItem.value || {}

  initializeFormData(itemData)

  if (isProducts.value) {
    await initializeProductData(itemData)
  } else if (isCategories.value) {
    await initializeCategoryData(itemData)
  }
}

const initializeProductData = async (itemData) => {
  files.value = await getFilesToProduct(itemData.id)

  formData.value.images = initFiles(
    files.value?.filter((file) => file.type === FILE_TYPES.PHOTO),
    'images'
  )

  formData.value.video = initFiles(
    files.value?.filter((file) => file.type === FILE_TYPES.VIDEO),
    'video'
  )

  if (itemData.category_id) {
    await loadCategoryAttributeGroupsForProduct(itemData.category_id)
  }

  await loadProductAttributes(itemData.id)
}

const initializeCategoryData = async (itemData) => {
  if (itemData.image) {
    formData.value.image = [
      {
        id: itemData.id,
        url: itemData.image,
        nameUrl: itemData.image.split('/').pop(),
        name: itemData.image.split('/').pop(),
        isExisting: true,
      },
    ]
  } else {
    formData.value.image = []
  }

  if (itemData.id) {
    const allAttributeGroups = getAllAttributeGroupsForCategory(itemData.id)
    categoryAttributeLinks.value = getCategoryAttributeGroups(itemData.id)
    selectedAttributeGroups.value = allAttributeGroups.map((group) => ({
      group_id: group.group_id,
      require: group.require,
      inherited: group.inherited,
    }))
  }
}

// Методы для работы с файлами
const getFilesToProduct = async (productId) => {
  try {
    return await get(`product-to-files?external_product_id=${productId}`)
  } catch (error) {
    console.error('Ошибка загрузки файлов:', error)
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  }
}

// Методы для работы с атрибутами
// const addAdditionalAttribute = () => {
//   additionalAttributes.value.push({
//     id: `temp-${Date.now()}`,
//     group_id: null,
//     attribute_id: null,
//     new_attribute_name: '',
//     show_new_input: false,
//   })
// }

// const removeAdditionalAttribute = (index) => {
//   additionalAttributes.value.splice(index, 1)
// }

// const handleAdditionalGroupSelect = async (index, groupId) => {
//   const attr = additionalAttributes.value[index]
//   attr.group_id = groupId
//   attr.attribute_id = null
//   attr.show_new_input = false

//   if (groupId) {
//     await loadAttributesForGroup(groupId)
//   }
// }

// const handleAdditionalAttributeSelect = (index, attributeId) => {
//   const attr = additionalAttributes.value[index]

//   if (attributeId === 'new') {
//     attr.show_new_input = true
//     attr.new_attribute_name = ''
//   } else {
//     attr.attribute_id = attributeId
//     attr.show_new_input = false

//     if (attributeId && !selectedAttributes.value.includes(attributeId)) {
//       selectedAttributes.value = [...selectedAttributes.value, attributeId]
//     }
//   }
// }

// const createAdditionalAttribute = async (index) => {
//   const attr = additionalAttributes.value[index]
//   if (!attr.new_attribute_name.trim() || !attr.group_id) return

//   try {
//     const newAttribute = await createNewAttribute(attr.group_id, attr.new_attribute_name.trim())

//     if (!selectedAttributes.value.includes(newAttribute.id)) {
//       selectedAttributes.value = [...selectedAttributes.value, newAttribute.id]
//     }

//     attr.attribute_id = newAttribute.id
//     attr.show_new_input = false
//     attr.new_attribute_name = ''
//   } catch (error) {
//     console.error('Ошибка создания атрибута:', error)
//   }
// }

// const cancelAdditionalAttribute = (index) => {
//   const attr = additionalAttributes.value[index]
//   attr.show_new_input = false
//   attr.new_attribute_name = ''
//   attr.attribute_id = null
// }
// const removeSelectedAttribute = (attributeId) => {
//   selectedAttributes.value = selectedAttributes.value.filter((id) => id !== attributeId)
// }

// const loadAttributesForGroup = async (groupId) => {
//   if (attributesByGroup.value[groupId]?.length > 0) {
//     return attributesByGroup.value[groupId]
//   }

//   loadingAttributes.value[groupId] = true
//   try {
//     const attributes = filterAttributesByGroup(Number(groupId), true)
//     attributesByGroup.value[groupId] = attributes || []
//     return attributesByGroup.value[groupId]
//   } catch (error) {
//     console.error(`Ошибка загрузки атрибутов для группы ${groupId}:`, error)
//     return []
//   } finally {
//     loadingAttributes.value[groupId] = false
//   }
// }

// const createNewAttribute = async (groupId, attributeName) => {
//   try {
//     const newAttribute = await post('product-attributes', {
//       attribute_value: attributeName,
//       group_id: groupId,
//     })

//     if (attributesByGroup.value[groupId]) {
//       attributesByGroup.value[groupId].push(newAttribute)
//     } else {
//       attributesByGroup.value[groupId] = [newAttribute]
//     }

//     return newAttribute
//   } catch (error) {
//     console.error('Ошибка создания атрибута:', error)
//     throw error
//   }
// }



const loadProductAttributes = async (productId) => {
  try {
    const connection = await get('product-to-attributes')
    const productToAttributes = connection?.filter((item) => item.product_id === productId)

    if (productToAttributes?.length > 0) {
      selectedAttributes.value = productToAttributes.map((item) => item.attribute_id)
    } else {
      selectedAttributes.value = []
    }
  } catch (error) {
    console.error('Ошибка загрузки связанных атрибутов товара:', error)
    selectedAttributes.value = []
  }
}

const loadCategoryAttributeGroupsForProduct = async (categoryId) => {
  try {
    const links = await get(`category-to-attributes?external_category_id=${categoryId}`)

    const uniqueLinks = links.reduce((acc, current) => {
      const existingGroup = acc.find((item) => item.external_attribute_group_id === current.external_attribute_group_id)

      if (!existingGroup) {
        acc.push(current)
      } else if (current.require === 1 && existingGroup.require === 0) {
        const index = acc.findIndex((item) => item.external_attribute_group_id === current.external_attribute_group_id)
        acc[index] = current
      }
      return acc
    }, [])

    categoryAttributeGroupsForProduct.value = uniqueLinks || []
  } catch (error) {
    console.error('Ошибка загрузки групп атрибутов категории:', error)
  }

  await loadProductAttributes(itemData.id)
}

// Методы загрузки данных
const loadGroupsProducts = async () => {
  try {
    groupsProduct.value = (await get('categories')) || []
  } catch (error) {
    console.error('Ошибка загрузки групп товаров:', error)
  }
}

const loadCategoriesList = async () => {
  try {
    categoriesList.value = (await get('product-groups')) || []
  } catch (error) {
    console.error('Ошибка загрузки списка категорий:', error)
  }
}

// Методы для работы с группами атрибутов категорий
const createNewAttributeGroups = async () => {
  const newGroups = selectedAttributeGroups.value.filter((group) => group.isNew)
  const createdGroups = []

  for (const group of newGroups) {
    try {
      const response = await post('product-attribute-groups', { name: group.name })
      createdGroups.push({
        tempId: group.tempId,
        newId: response.id,
        name: group.name,
        require: group.require,
      })
    } catch (error) {
      console.error('Ошибка создания группы атрибутов:', error)
      throw new Error(`Не удалось создать группу атрибутов: ${group.name}`)
    }
  }

  if (createdGroups.length > 0) {
    await loadGroupsAttributes()
  }

  return createdGroups
}

const updateAttributeGroupsWithRealIds = (createdGroups) => {
  const updatedGroups = selectedAttributeGroups.value.map((group) => {
    if (group.isNew) {
      const createdGroup = createdGroups.find((g) => g.tempId === group.tempId)
      if (createdGroup) {
        return {
          group_id: createdGroup.newId,
          require: group.require,
          isNew: false,
        }
      }
    }
    return group
  })

  return updatedGroups.filter((group) => !group.isNew)
}

const handleCategoryAttributeGroups = async (categoryId) => {
  if (!isCategories.value) return

  const currentCategoryId = categoryId || parseInt(id.value)

  const ownGroups = selectedAttributeGroups.value.filter((group) => !group.inherited)
  const currentLinks = getCategoryAttributeGroups(currentCategoryId)

  const existingLinksMap = new Map()
  currentLinks.forEach((link) => {
    existingLinksMap.set(link.external_attribute_group_id, link)
  })

  // Обрабатываем выбранные группы
  for (const selectedGroup of ownGroups) {
    const existingLink = existingLinksMap.get(selectedGroup.group_id)

    if (existingLink) {
      if (existingLink.require !== (selectedGroup.require ? 1 : 0)) {
        await updateCategoryAttributeLink(existingLink.id, {
          external_category_id: currentCategoryId,
          external_attribute_group_id: selectedGroup.group_id,
          require: selectedGroup.require ? 1 : 0,
        })
      }
    } else {
      await createCategoryAttributeLink({
        external_category_id: currentCategoryId,
        external_attribute_group_id: selectedGroup.group_id,
        require: selectedGroup.require ? 1 : 0,
      })

      const hasChildren = categoriesList.value.some((cat) => cat.parent_id === currentCategoryId)
      if (hasChildren) {
        await addAttributeGroupToChildren(currentCategoryId, selectedGroup.group_id, selectedGroup.require ? 1 : 0)
      }
    }
  }

  // Удаляем старые связи
  for (const existingLink of currentLinks) {
    const stillSelected = ownGroups.some((selected) => selected.group_id === existingLink.external_attribute_group_id)

    if (!stillSelected) {
      await deleteCategoryAttributeLink(existingLink.id)

      const hasChildren = categoriesList.value.some((cat) => cat.parent_id === currentCategoryId)
      if (hasChildren) {
        await removeAttributeGroupFromChildren(currentCategoryId, existingLink.external_attribute_group_id)
      }
    }
  }
}

const initializeNewCategoryWithInheritance = async (parentId) => {
  if (!parentId) {
    selectedAttributeGroups.value = []
    return
  }

  // Для новой категории наследуем группы атрибутов от родителя
  const parentGroups = getParentAttributeGroups(parentId)
  selectedAttributeGroups.value = parentGroups.map((group) => ({
    group_id: group.group_id,
    require: group.require,
    inherited: true,
  }))
}

// Основные методы сохранения
const saveContent = async () => {
  try {
    if (isNewItem.value) {
      await createNewItem()
      return
    }

    const oldImage = currentItem.value?.image

    if (isCategories.value) {
      await saveCategoryWithAttributeGroups()
      return
    }

    await handleFileOperations()

    if (isProducts.value) {
      await handleAttributeOperations()
    }

    if (isAttributes.value) {
      await attributeEditorProductToAttribute()
    }

    await updateItem()

    if (isCategories.value && !formData.value.image && oldImage) {
      await deleteCategoryImage(oldImage)
    }

    await deleteMarkedFiles()
    toast.success('Данные сохранены', { autoClose: 1000 })
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    toast.error(`Ошибка сохранения: ${error.message}`, { autoClose: 1000 })
  }
}

const saveCategoryWithAttributeGroups = async () => {
  let createdGroups = []
  let categoryId = parseInt(id.value)

  try {
    const newGroups = selectedAttributeGroups.value.filter((group) => group.isNew)
    if (newGroups.length > 0) {
      createdGroups = await createNewAttributeGroups()
      selectedAttributeGroups.value = updateAttributeGroupsWithRealIds(createdGroups)
    }

    await handleFileOperations()

    if (isNewItem.value) {
      const newCategory = await createItem()
      categoryId = newCategory.id
      currentItem.value = newCategory
      router.replace({ name: 'Edit', params: { name: routeParamName.value, id: categoryId } })
    } else {
      await updateItem()
    }

    await handleCategoryAttributeGroups(categoryId)
    toast.success('Данные сохранены', { autoClose: 1000 })
  } catch (error) {
    console.error('Ошибка сохранения категории:', error)
    if (createdGroups.length > 0) {
      console.warn('Были созданы новые группы атрибутов, но произошла ошибка:', createdGroups)
    }
    throw error
  }
}

const handleFileOperations = async () => {
  if (isProducts.value) {
    await handleProductFiles()
  } else if (isCategories.value) {
    await handleCategoryFiles()
  }
}

const handleProductFiles = async () => {
  const newImages = formData.value.images.filter((img) => !img.isExisting)
  if (newImages.length > 0) {
    imagesSrc.value = await uploadMultipleFiles(id.value, formData.value.images, routeParamName.value)
    await productToFile(id.value, imagesSrc.value, FILE_TYPES.PHOTO)
    updateImagesWithNewUrls()
  }

  if (formData.value.video && !formData.value.video.isExisting) {
    videoSrc.value = await uploadFile(id.value, formData.value.video, routeParamName.value)
    await productToFile(id.value, videoSrc.value, FILE_TYPES.VIDEO)
    updateVideoWithNewUrl()
  }
}

const handleCategoryFiles = async () => {
  if (!formData.value.image || formData.value.image.length === 0) {
    formData.value.image = null
    return
  }

  if (formData.value.image.length > 0) {
    const imageFile = formData.value.image[0]

    if (!imageFile.isExisting) {
      const uploadedFileName = await uploadFile(id.value, imageFile, routeParamName.value)
      const uploadedImageUrl = `https://back.love-kitchen.ru/web/uploads/${uploadedFileName}`
      formData.value.image = uploadedImageUrl
    } else {
      formData.value.image = imageFile.url
    }
  }
}

const handleAttributeOperations = async () => {
  const currentProductAttributes = await get(`product-to-attributes?product_id=${id.value}`)

  const currentAttributeIds = currentProductAttributes.map((item) => item.attribute_id)
  const newAttributeIds = selectedAttributes.value

  const attributesToRemove = currentAttributeIds.filter((attrId) => !newAttributeIds.includes(attrId))
  const attributesToAdd = newAttributeIds.filter((attrId) => !currentAttributeIds.includes(attrId))

  // Удаляем связи
  for (const attributeId of attributesToRemove) {
    await removeAttributeFromProduct(Number(id.value), attributeId)
  }

  // Добавляем новые связи
  if (attributesToAdd.length > 0) {
    const attributesToCreate = attributesToAdd.map((attrId) => ({ id: attrId }))
    await productToAttributes(id.value, attributesToCreate)
  }

  // Добавляем новые связи
  if (attributesToAdd.length > 0) {
    const attributesToCreate = attributesToAdd.map((attrId) => ({ id: attrId }))
    await productToAttributes(id.value, attributesToCreate)
  }
}
const updatePhoto = (event) => (formData.value.photo = event)

const attributeEditorProductToAttribute = async () => {
  if (formData.value.product_id) {
    await productToAttribute(formData.value.product_id, formData.value.id)
  }
}

// Вспомогательные методы
const updateImagesWithNewUrls = () => {
  let newImageIndex = 0
  formData.value.images = formData.value.images.map((img) => {
    if (img.isExisting) return img

    return {
      ...img,
      url: `https://back.love-kitchen.ru/web/uploads/${imagesSrc.value[newImageIndex]}`,
      nameUrl: imagesSrc.value[newImageIndex++],
      isExisting: true,
    }
  })
}

const updateVideoWithNewUrl = () => {
  if (formData.value.video && !formData.value.video.isExisting) {
    formData.value.video = {
      ...formData.value.video,
      url: `https://back.love-kitchen.ru/web/uploads/${videoSrc.value}`,
      nameUrl: videoSrc.value,
      isExisting: true,
    }
  }
}

const createNewItem = async () => {
  if (isCategories.value) {
    await saveCategoryWithAttributeGroups(null)
    return
  }

  const newItem = await createItem()
  currentItem.value = newItem
  router.replace({ name: 'Edit', params: { name: routeParamName.value, id: newItem.id } })
}

const goBack = () => {
  clearFilesToDelete()
  router.push({ name: 'List', params: { pathName: routeParamName.value } })
}

// Event handlers
const updateSelectAttributes = (event) => {
  selectedAttributes.value = event
}

const updateImages = (event) => {
  formData.value.images = event
}

const updateImage = (event) => {
  formData.value.image = event

  if (event.length === 0 && currentItem.value?.image) {
    const fileToDelete = {
      id: currentItem.value.id,
      url: currentItem.value.image,
      nameUrl: currentItem.value.image.split('/').pop(),
      name: currentItem.value.image.split('/').pop(),
      isExisting: true,
    }
    handleFileRemove(fileToDelete, Number(id.value))
  }
}

const updateVideo = (event) => {
  formData.value.video = event
}

const updateSelectedAttributeGroups = (event) => {
  selectedAttributeGroups.value = event
}

const removeFile = async (file, filesArray = null) => {
  handleFileRemove(file, Number(id.value), filesArray)
}

// Удаление элемента
const deleteElem = async () => {
  console.log('routeParamName.value', routeParamName.value)
  console.log('id', id.value)
  try {
    await del(`${routeParamName.value}/${id.value}`)
    toast.success('Элемент удален', { autoClose: 1000 })

    router.push({
      name: 'List',
      params: {
        pathName: routeParamName.value,
      },
    })
  } catch (error) {
    console.error(error)
    toast.error('Ошибка при удалении', { autoClose: 1000 })
  }
}

// const updateSelectedAttributeGroups = (event) => {
//   selectedAttributeGroups.value = event
// }

const removeFile = async (file, filesArray = null) => {
  handleFileRemove(file, Number(id.value), filesArray)
}

// Удаление элемента
const deleteElem = async () => {
  console.log('name.value', name.value)
  console.log('id', id.value)
  try {
    await del(`${name.value}/${id.value}`)
    toast.success('Элемент удален', { autoClose: 1000 })

    router.push({
      name: 'List',
      params: {
        pathName: name.value,
      },
    })
  } catch (error) {
    console.error(error)
    toast.error('Ошибка при удалении', { autoClose: 1000 })
  }
}

// Watchers
watch([routeParamName, id], loadItemData)
watch(() => formData.value.groupAttribute, filterAttributesByGroup)
watch(
  () => formData.value.groupProduct,
  async (newCategoryId) => {
    if (isProducts.value && newCategoryId) {
      await loadCategoryAttributeGroupsForProduct(newCategoryId)
    }
  }
)
// Новый метод для загрузки групп атрибутов с учетом наследования
const loadCategoryAttributeGroupsForCurrentCategory = async () => {
  if (!id.value || id.value === 'new') return

  try {
    const currentCategoryId = parseInt(id.value)
    const allAttributeGroups = getAllAttributeGroupsForCategory(currentCategoryId)

    selectedAttributeGroups.value = allAttributeGroups.map((group) => ({
      group_id: group.group_id,
      require: group.require,
      inherited: group.inherited,
    }))

    // Также обновляем локальные связи
    categoryAttributeLinks.value = getCategoryAttributeGroups(currentCategoryId)
  } catch (error) {
    console.error('Ошибка загрузки групп атрибутов:', error)
  }
}

watch(
  () => formData.value.parent_id,
  async (newParentId) => {
    if (isCategories.value) {
      if (isNewItem.value) {
        // Для новой категории - наследуем группы
        await initializeNewCategoryWithInheritance(newParentId)
      } else {
        // Для существующей категории - перезагружаем с учетом нового родителя
        await loadCategoryAttributeGroupsForCurrentCategory()
      }
    }
  }
)
// Lifecycle
onMounted(async () => {
  formData.value.type = routeParamName.value

  const loaders = []

  if (isProducts.value) {
    loaders.push(loadGroupsProducts(), loadGroupsAttributes(), loadAttributes())
  } else if (isAttributes.value) {
    loaders.push(loadGroupsAttributes())
  } else if (isCategories.value) {
    loaders.push(loadCategoriesList(), loadCategoryAttributeGroups(), loadAllCategories(), loadGroupsAttributes())
  }

  await Promise.all(loaders)
  await loadItemData()
})

const updateParentCat = (event) => {
  console.log('updateParentCat', event)
  formData.value.parent_id = event
}
const changeLevel = (event) => {
  console.log('changeLevel', event)
  formData.value.level = event
}
</script>

<template>
  <div class="page-container">
    <BackButton @click="goBack" />

    <ProductsEditor
      v-if="routeParamName === 'products'"
      :form-data="formData"
      :groups-product="groupsProduct"
      :groups-attribute="groupsAttribute"
      :filtered-attributes="filteredAttributes"
      :selected-attributes="selectedAttributes"
      :attributes-loaded="attributesLoaded"
      :current-id="id"
      :get-attribute-name="getAttributeName"
      @save="saveContent"
      @update:group-attribute="filterAttributesByGroup"
      @remove-video="(event) => removeFile(event)"
      @remove-image="(event) => removeFile(event, formData.images)"
      @update:images="updateImages"
      @update:video="updateVideo"
      @remove-attribute="(event) => removeAttributeFromProduct(Number(id), event)"
      @update:selected-attributes="updateSelectAttributes"
    />

    <GenericEditor
      v-else-if="isCategories || isAttributeGroups"
      :form-data="formData"
      :entity-type="routeParamName"
      :current-id="id"
      :categories-list="categoriesList"
      :groups-attribute="groupsAttribute"
      :selected-attribute-groups="selectedAttributeGroups"
      @update:selected-attribute-groups="updateSelectedAttributeGroups"
      @save="saveContent"
      @remove-photo="(event) => removeFile(event, formData.photo)"
      @update:images="updatePhoto"
      @change-parent-cat="updateParentCat"
      @change-level="changeLevel"
      @cancel="deleteElem"
    />

    <AttributeEditor
      v-else-if="routeParamName === 'product-attributes'"
      :form-data="formData"
      :groups-attribute="groupsAttribute"
      :current-id="id"
      @save="saveContent"
      @cancel="deleteElem"
    />
  </div>
</template>

<style scoped>
/* ВСЕ ОСТАЛЬНЫЕ СТИЛИ ОСТАЮТСЯ ЗДЕСЬ */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

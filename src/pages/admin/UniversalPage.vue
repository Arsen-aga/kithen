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

// Components
import BackButton from '@/components/UI/BackButton.vue'
import ProductsEditor from '@/components/Editors/ProductsEditor.vue'
import AttributeEditor from '@/components/Editors/AttributeEditor.vue'
import GenericEditor from '@/components/Editors/GenericEditor.vue'

const route = useRoute()
const router = useRouter()
const { get } = useApi()

// Реактивные данные
const name = computed(() => route.params.name)
const id = computed(() => route.params.id)
const files = ref([])
const groupsProduct = ref([])
const productForAttribute = ref([])
const attributeForProduct = ref([])
const categoriesList = ref([])

// Инициализация хелперсов
const { formData, currentItem, createItem, updateItem, resetForm, initializeFormData } = useFormManager(name.value, {
  id,
})

const {
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

// Основные методы
const loadItemData = async () => {
  if (id.value === 'new') {
    resetForm()
    return
  }

  try {
    const response = await get(`${name.value}/${id.value}`)
    currentItem.value = response
    initializeEditorData()
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  }
}

const getFilesToProduct = async (productId) => {
  try {
    const response = get(`external-product-to-files?external_product_id=${productId}`)
    return response
  } catch (error) {
    console.log(error)
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  }
}

const initializeEditorData = async () => {
  const itemData = currentItem.value || {}
  console.log('itemData', itemData)

  initializeFormData(itemData)

  if (name.value === 'external-products') {
    files.value = await getFilesToProduct(itemData.id)

    formData.value.images = initFiles(
      files.value?.filter((file) => file.type === 'photo'),
      'images'
    )
    formData.value.video = initFiles(
      files.value?.filter((file) => file.type === 'video'),
      'video'
    )
  } else if (name.value === 'external-categories') {
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
  }

  console.log('itemData', itemData)
  await loadAttributeForProductsFor()
  console.log('attributeForProduct.value', attributeForProduct.value)
  if (itemData.attributes && Array.isArray(itemData.attributes)) {
    console.log('itemData.attributes', itemData.attributes)
    selectedAttributes.value = itemData.attributes
    console.log('selectedAttributes.value', selectedAttributes.value)
  }
}

const loadGroupsProducts = async () => {
  try {
    groupsProduct.value = (await get('external-categories')) || []
  } catch (error) {
    console.error('Ошибка загрузки групп товаров:', error)
  }
}
const loadProductsForAttribute = async () => {
  try {
    productForAttribute.value = (await get('external-products')) || []
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error)
  }
}
const loadAttributeForProductsFor = async () => {
  try {
    const response = (await get('external-product-to-attributes')) || []
    const attrsForProduct = response.filter((item) => item.product_id === Number(id.value))
    attributeForProduct.value = attrsForProduct
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error)
  }
}
const loadCategoriesList = async () => {
  try {
    categoriesList.value = (await get('external-categories')) || []
    console.log('Загруженные категории:', categoriesList.value)
  } catch (error) {
    console.error('Ошибка загрузки списка категорий:', error)
  }
}

const saveContent = async () => {
  try {
    // Для нового товара сначала создаем его
    if (id.value === 'new') {
      await createNewItem()
      return
    }
    const oldImage = currentItem.value?.image

    await handleFileOperations()

    // Загрузка и связывание файлов (только для продуктов)
    if (name.value === 'external-products') {
      await handleAttributeOperations()
    }

    // связывание атрибутов
    if (name.value === 'external-product-attributes') {
      await attributeEditorProductToAttribute()
    }

    // Обновление основного объекта
    await updateItem()

    // Если изображение категории было удалено (стало null) и раньше было значение
    if (name.value === 'external-categories' && !formData.value.image && oldImage) {
      console.log('Удаляем старое изображение категории с сервера:', oldImage)
      console.log(oldImage)
      await deleteCategoryImage(oldImage)
    }

    await deleteMarkedFiles()

    toast.success('Данные сохранены', { autoClose: 1000 })
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    toast.error(`Ошибка сохранения: ${error.message}`, { autoClose: 1000 })
  }
}

const handleFileOperations = async () => {
  // Загрузка новых изображений
  if (name.value === 'external-products') {
    const newImages = formData.value.images.filter((img) => !img.isExisting)
    console.log('сохранение новых картинок', newImages)
    if (newImages.length > 0) {
      imagesSrc.value = await uploadMultipleFiles(id.value, formData.value.images, name.value)
      await productToFile(id.value, imagesSrc.value, 'photo')
      updateImagesWithNewUrls()
    }

    // Загрузка нового видео
    if (formData.value.video && !formData.value.video.isExisting) {
      videoSrc.value = await uploadFile(id.value, formData.value.video, name.value)
      await productToFile(id.value, videoSrc.value, 'video')
      updateVideoWithNewUrl()
    }
  }
  // Для категорий - загрузка одиночного изображения
  if (name.value === 'external-categories') {
    console.log('formData.value.image для категории:', formData.value.image)

    // Если изображение удалено (пустой массив) - устанавливаем null
    if (!formData.value.image || formData.value.image.length === 0) {
      console.log('Изображение удалено, устанавливаем null')
      formData.value.image = null
      return
    }

    // Если есть новое изображение для загрузки
    if (formData.value.image && formData.value.image.length > 0) {
      const imageFile = formData.value.image[0]

      // Загружаем только если это новый файл
      if (!imageFile.isExisting) {
        console.log('Загружаем новое изображение для категории:', imageFile)
        const uploadedFileName = await uploadFile(id.value, imageFile, name.value)
        const uploadedImageUrl = `https://back.love-kitchen.ru/web/uploads/${uploadedFileName}`
        console.log('Загруженный URL изображения:', uploadedImageUrl)

        // Обновляем formData с новым URL
        formData.value.image = uploadedImageUrl
      } else {
        // Если изображение уже существует, просто используем его URL
        formData.value.image = imageFile.url
      }
    }
  }
}

const handleAttributeOperations = async () => {
  if (selectedAttributes.value.length > 0) {
    console.log('сохранение атрибутов', attributes)
    formData.value.attributes = selectedAttributes.value
    await productToAttributes(id.value, formData.value.attributes)
  }
}

const attributeEditorProductToAttribute = async () => {
  if (formData.value.product_id) {
    await productToAttribute(formData.value.product_id, formData.value.id)
  }
}

const updateSelectAttributes = (event) => (selectedAttributes.value = event)
const updateImages = (event) => (formData.value.images = event)
const updateImage = (event) => {
  console.log('Обновление изображения категории:', event)

  // Если передан пустой массив - это значит изображение удалено
  // Сохраняем как пустой массив, который затем в handleFileOperations превратится в null
  formData.value.image = event

  // Если изображение удалено (пустой массив), сразу помечаем файл на удаление
  if (event.length === 0 && currentItem.value?.image) {
    console.log('Изображение удалено, помечаем файл на удаление')
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
const updateVideo = (event) => (formData.value.video = event)

const updateImagesWithNewUrls = () => {
  let newImageIndex = 0
  formData.value.images = formData.value.images.map((img) => {
    if (img.isExisting) return img

    return {
      ...img,
      url: `https://back.love-kitchen.ru/web/uploads/${imagesSrc.value[newImageIndex]}`,
      nameUrl: imagesSrc.value[newImageIndex],
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
  const newItem = await createItem()
  currentItem.value = newItem
  const newId = newItem.id
  router.replace({ name: 'Edit', params: { name: name.value, id: newId } })
}

const goBack = () => {
  clearFilesToDelete()
  router.push({ name: 'List', params: { pathName: name.value } })
}

// Watchers
watch([name, id], loadItemData)
watch(() => formData.value.groupAttribute, filterAttributesByGroup)

// Lifecycle
onMounted(async () => {
  formData.value.type = name.value

  if (name.value === 'external-products') {
    await Promise.all([loadGroupsProducts(), loadGroupsAttributes(), loadAttributes()])
  } else if (name.value === 'external-product-attributes') {
    await Promise.all([loadGroupsAttributes(), loadProductsForAttribute()])
  } else if (name.value === 'external-categories') {
    await loadCategoriesList() // Загружаем список категорий для выбора родителя
  }

  await loadItemData()
})

const removeFile = async (file, filesArray = null) => {
  console.log('Удаляем файл из UI:', file)
  handleFileRemove(file, Number(id.value), filesArray)
}
</script>

<template>
  <div class="page-container">
    <BackButton @click="goBack" />
    <ProductsEditor
      v-if="name === 'external-products'"
      :form-data="formData"
      :groups-product="groupsProduct"
      :groups-attribute="groupsAttribute"
      :filtered-attributes="filteredAttributes"
      :selected-attributes="attributeForProduct"
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
      v-else-if="['external-categories', 'external-product-attribute-groups'].includes(name)"
      :form-data="formData"
      :entity-type="name"
      :current-id="id"
      :categories-list="categoriesList"
      @remove-image="(event) => removeFile(event, formData.image)"
      @update:images="updateImage"
      @save="saveContent"
    />

    <AttributeEditor
      v-else-if="name === 'external-product-attributes'"
      :form-data="formData"
      :groups-attribute="groupsAttribute"
      :product-for-attribute="productForAttribute"
      :current-id="id"
      @save="saveContent"
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

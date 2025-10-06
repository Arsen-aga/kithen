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
const groupsProduct = ref([])

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
  removeFileFromProduct,
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
    console.log(currentItem.value)
    initializeEditorData()
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  }
}

const initializeEditorData = () => {
  const itemData = currentItem.value || {}

  initializeFormData(itemData)

  formData.value.images = initFiles(
    itemData.files?.filter((file) => file.type === 'photo'),
    'images'
  )
  formData.value.video = initFiles(
    itemData.files?.filter((file) => file.type === 'video'),
    'video'
  )

  if (itemData.attrs && Array.isArray(itemData.attrs)) {
    selectedAttributes.value = itemData.attrs.map((attr) => attr.id)
  }
}

const loadGroupsProducts = async () => {
  try {
    groupsProduct.value = (await get('product-groups')) || []
  } catch (error) {
    console.error('Ошибка загрузки групп товаров:', error)
  }
}

const saveContent = async () => {
  try {
    // Для нового товара сначала создаем его
    if (id.value === 'new') {
      await createNewItem()
      return
    }

    // Загрузка и связывание файлов (только для продуктов)
    if (name.value === 'products') {
      await handleAttributeOperations()
      await handleFileOperations()
    }

    // Обновление основного объекта
    await updateItem()

    toast.success('Данные сохранены', { autoClose: 1000 })
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    toast.error(`Ошибка сохранения: ${error.message}`, { autoClose: 1000 })
  }
}

const handleFileOperations = async () => {
  // Загрузка новых изображений
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

const handleAttributeOperations = async () => {
  if (selectedAttributes.value.length > 0) {
    console.log('сохранение атрибутов', attributes)
    formData.value.attrs = selectedAttributes.value
    await productToAttributes(id.value, formData.value.attrs)
  }
}

const updateSelectAttributes = (event) => (selectedAttributes.value = event)
const updateImages = (event) => (formData.value.images = event)
const updatePhoto = (event) => (formData.value.photo = event)
const updateVideo = (event) => {
  formData.value.video = event
  console.log(formData.value.video)
}

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
  router.push({ name: 'List', params: { pathName: name.value } })
}

// Watchers
watch([name, id], loadItemData)
watch(() => formData.value.groupAttribute, filterAttributesByGroup)
watch((formData) => console.log(formData))

// Lifecycle
onMounted(async () => {
  formData.value.type = name.value

  if (name.value === 'products') {
    await Promise.all([loadGroupsProducts(), loadGroupsAttributes(), loadAttributes()])
  } else if (name.value === 'product-attributes') {
    await loadGroupsAttributes()
  }

  await loadItemData()
})

const removeFile = async (file, productId, filesArray = null) => {
  try {
    await handleFileRemove(file, filesArray)
    await removeFileFromProduct(productId, file)
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="page-container">
    <BackButton @click="goBack" />

    <ProductsEditor
      v-if="name === 'products'"
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
      @remove-video="(event) => removeFile(event, Number(id))"
      @remove-image="(event) => removeFile(event, Number(id), formData.images)"
      @update:images="updateImages"
      @update:video="updateVideo"
      @remove-attribute="(event) => removeAttributeFromProduct(Number(id), event)"
      @update:selected-attributes="updateSelectAttributes"
    />

    <GenericEditor
      v-else-if="['product-groups', 'product-attribute-groups'].includes(name)"
      :form-data="formData"
      :entity-type="name"
      :current-id="id"
      @save="saveContent"
    />
    <!-- @remove-photo="(event) => removeFile(event, Number(id))"
      @update:photo="updatePhoto" -->

    <AttributeEditor
      v-else-if="name === 'product-attributes'"
      :form-data="formData"
      :groups-attribute="groupsAttribute"
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
  padding: 20px;
}
</style>

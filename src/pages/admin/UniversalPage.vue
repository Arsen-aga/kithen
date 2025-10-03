<script setup>
import axios from 'axios'
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDefaultItems } from '@/stores/default'
import { deleteFile, useFileUpload } from '@/helpers/useFileUpload'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import DragDropImages from '@/components/UI/DragDropImages.vue'
import AdminAddVideo from '@/components/UI/AdminAddVideo.vue'

const { uploadFile, uploadMultipleFiles } = useFileUpload()
const route = useRoute()
const router = useRouter()
const store = useDefaultItems()
const token = store.getBearer

const headersPost = {
  headers: {
    // 'Content-Type': 'x-www-form-urlencoded',
    // 'Content-Type': 'multipart/from-data',
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + token,
  },
}
const headersGet = {
  headers: {
    Authorization: 'Bearer ' + token,
  },
}

// Получаем параметры из роута
const name = computed(() => route.params.name)
const id = computed(() => route.params.id)

// Реактивные переменные
const formData = ref({
  type: '',
  title: '',
  video: null,
  attrs: [],
  images: [],
  description: '',
  groupProduct: '',
  groupAttribute: '',
})
const groupsProduct = ref([])
const groupsAttribute = ref([])
const attributes = ref([])
const filteredAttributes = ref([])
const selectedAttributes = ref([])
const imagesSrc = ref([])
const videoSrc = ref(null)
const attributesLoaded = ref(false)
const currentItem = ref(null)

// Methods
const productToFile = async (fileNames, type) => {
  if (!id.value || id.value === 'new') {
    throw new Error('ID товара не найден')
  }

  const createConnection = async (filename, type) => {
    try {
      const newFormData = new FormData()
      newFormData.append('product_id', id.value)
      newFormData.append('type', type)
      newFormData.append('filename', filename)

      const response = await axios.post(`${store.getApiDomain}/product-to-files`, newFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + token,
        },
      })
      return response.data
    } catch (error) {
      console.error('Ошибка связи файла с товаром:', error)
      throw new Error(`Ошибка связи файла с товаром: ${error.message}`)
    }
  }

  if (Array.isArray(fileNames) && fileNames.length > 0) {
    const results = []
    for (const imgUrl of fileNames) {
      const res = await createConnection(imgUrl, type)
      if (res) results.push(res)
    }
    return results
  } else if (fileNames) {
    const res = await createConnection(fileNames, type)
    if (res) return res
  }
}

const productToAttributes = async (attributes) => {
  if (!id.value || id.value === 'new') {
    throw new Error('ID товара не найден')
  }

  const createConnection = async (attribute) => {
    try {
      const newFormData = new FormData()
      newFormData.append('product_id', id.value)
      newFormData.append('attribute_id', attribute)

      const response = await axios.post(`${store.getApiDomain}/product-to-attributes`, newFormData, headersPost)
      console.log('связь создана', response.data)
      return response.data
    } catch (error) {
      console.error('Ошибка связи атрибута с товаром:', error)
      throw new Error(`Ошибка связи атрибута с товаром: ${error.message}`)
    }
  }

  const results = []
  for (const attribute of attributes) {
    const res = await createConnection(attribute)
    if (res) results.push(res)
  }
  return results
}

// Фильтрация атрибутов по выбранной группе
const filterAttributesByGroup = (groupId) => {
  if (!groupId) {
    filteredAttributes.value = []
    return
  }
  filteredAttributes.value = attributes.value.filter((attr) => attr.group_id === groupId)
}

// Загрузка всех атрибутов
const loadAttributes = async () => {
  try {
    const response = await axios.get(`${store.getApiDomain}/product-attributes`, headersGet)
    attributes.value = response.data || []
    attributesLoaded.value = true
    console.log('Атрибуты загружены:', attributes.value)
  } catch (error) {
    console.error('Ошибка загрузки атрибутов:', error)
    attributesLoaded.value = true
  }
}

// Получение названия атрибута по ID
const getAttributeName = (attributeId) => {
  if (!attributesLoaded.value) {
    return 'Загрузка...'
  }
  const attribute = attributes.value.find((attr) => attr.id === attributeId)
  return attribute?.Name || attribute?.name || `Атрибут #${attributeId}`
}

const removeAttributeToProduct = async (attributeId) => {
  let allConnections
  try {
    const response = await axios.get(`${store.getApiDomain}/product-to-attributes`, headersGet)
    allConnections = response.data
  } catch (error) {
    console.error(error)
  }

  const foundConnection = allConnections?.find(
    (item) => item.product_id === id.value && item.attribute_id === attributeId
  )

  if (!foundConnection) return

  try {
    const response = await axios.delete(`${store.getApiDomain}/product-to-attributes/${foundConnection.id}`, headersGet)
    console.log('удаленная связь', response.data)
  } catch (error) {
    console.error(error)
  }
}

// Удаление атрибута из товара
const removeAttributeFromProduct = async (attributeId) => {
  selectedAttributes.value = selectedAttributes.value.filter((id) => id !== attributeId)
  if (id.value && id.value !== 'new') {
    await removeAttributeToProduct(attributeId)
  }
}

// Methods
const loadGroupsProducts = async () => {
  try {
    const response = await axios.get(`${store.getApiDomain}/product-groups`, headersGet)
    groupsProduct.value = response.data || []
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
}

const loadGroupsAttributes = async () => {
  try {
    const response = await axios.get(`${store.getApiDomain}/product-attribute-groups`, headersGet)
    groupsAttribute.value = response.data || []
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
}

// Загрузка данных элемента
const loadItemData = async () => {
  if (id.value === 'new') {
    // Новый элемент - сбрасываем форму
    resetForm()
    return
  }

  try {
    const response = await axios.get(`${store.getApiDomain}/${name.value}/${id.value}`, headersGet)
    currentItem.value = response.data
    initializeEditorData()
    console.log('Загружены данные:', currentItem.value)
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  }
}

// Сохранение контента
const saveContent = async () => {
  try {
    // Для нового товара сначала создаем его, потом загружаем файлы
    if (id.value === 'new') {
      await createNewItem()
      return
    }

    // 1. Загружаем только НОВЫЕ изображения
    const newImages = formData.value.images.filter((img) => !img.isExisting)
    if (newImages.length > 0) {
      imagesSrc.value = await uploadMultipleFiles(id.value, formData.value.images, name.value)
      console.log('Загруженные новые изображения:', imagesSrc.value)
    }

    // 2. Загружаем только НОВОЕ видео
    if (formData.value.video && !formData.value.video.isExisting) {
      videoSrc.value = await uploadFile(id.value, formData.value.video, name.value)
      console.log('Загруженное новое видео:', videoSrc.value)
    }

    // 3. Связываем только НОВЫЕ изображения с товаром
    if (imagesSrc.value.length > 0 && id.value && id.value !== 'new') {
      await productToFile(imagesSrc.value, 'photo')

      let newImageIndex = 0
      formData.value.images = formData.value.images.map((img) => {
        if (img.isExisting) {
          return img
        }
        const updatedImage = {
          ...img,
          url: `https://back.love-kitchen.ru/web/uploads/${imagesSrc.value[newImageIndex]}`,
          nameUrl: imagesSrc.value[newImageIndex],
          isExisting: true,
        }
        newImageIndex++
        return updatedImage
      })
      console.log('Новые изображения связаны с товаром')
    }

    // 4. Связываем только НОВОЕ видео с товаром
    if (videoSrc.value && id.value && id.value !== 'new' && formData.value.video && !formData.value.video.isExisting) {
      await productToFile(videoSrc.value, 'video')
      formData.value.video = {
        ...formData.value.video,
        url: `https://back.love-kitchen.ru/web/uploads/${videoSrc.value}`,
        nameUrl: videoSrc.value,
        isExisting: true,
      }
      console.log('Новое видео связано с товаром')
    }

    // 5. Связываем атрибут с товаром
    if (selectedAttributes.value.length > 0 && id.value && id.value !== 'new') {
      formData.value.attrs = selectedAttributes.value
      await productToAttributes(formData.value.attrs)
      console.log('Атрибуты связаны с товаром')
    }

    // Обновляем основной объект
    let newObject, link
    if (name.value === 'products') {
      newObject = {
        ...currentItem.value,
        Name: formData.value.title,
        description: String(formData.value.description),
        Group: formData.value.groupProduct,
        attrs: selectedAttributes.value,
      }
      link = `${store.getApiDomain}/${name.value}/${id.value}`
    } else if (name.value === 'product-groups') {
      newObject = {
        ...currentItem.value,
        Name: formData.value.title,
      }
      link = `${store.getApiDomain}/${name.value}`
    } else if (name.value === 'product-attribute-groups') {
      newObject = {
        ...currentItem.value,
        name: formData.value.title,
      }
      link = `${store.getApiDomain}/${name.value}`
    } else if (name.value === 'product-attributes') {
      newObject = {
        ...currentItem.value,
        name: formData.value.title,
        group_id: formData.value.groupAttribute,
      }
      link = `${store.getApiDomain}/${name.value}`
    }

    console.log(link)
    let response
    if (id.value === 'new') {
      response = await axios.post(link, newObject, headersPost)
      // После создания перенаправляем на страницу редактирования с новым ID
      const newId = response.data.id
      router.replace({ name: 'Edit', params: { name: name.value, id: newId } })
    } else {
      response = await axios.patch(link, newObject, headersPost)
    }

    const data = response.data
    console.log(data)

    toast.success('Данные сохранены', { autoClose: 1000 })
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    toast.error(`Ошибка сохранения: ${error.message}`, { autoClose: 1000 })
  }
}

// Создание нового элемента
const createNewItem = async () => {
  let newObject, link
  if (name.value === 'products') {
    newObject = {
      Name: formData.value.title,
      description: String(formData.value.description),
      Group: formData.value.groupProduct,
    }
  } else if (name.value === 'product-groups') {
    newObject = {
      Name: formData.value.title,
    }
  } else if (name.value === 'product-attribute-groups') {
    newObject = {
      name: formData.value.title,
    }
  } else if (name.value === 'product-attributes') {
    newObject = {
      name: formData.value.title,
      group_id: formData.value.groupAttribute,
    }
  }

  link = `${store.getApiDomain}/${name.value}`
  const response = await axios.post(link, newObject, headersPost)
  currentItem.value = response.data
  return response.data
}

// Сброс формы
const resetForm = () => {
  formData.value = {
    type: name.value,
    title: '',
    video: null,
    attrs: [],
    images: [],
    description: '',
    groupProduct: '',
    groupAttribute: '',
  }
  selectedAttributes.value = []
  currentItem.value = null
}

const getContent = async () => {
  try {
    const response = await axios.get(`${store.getApiDomain}/product-to-attributes`, headersGet)
    console.log(response.data)
  } catch (error) {
    console.error(error)
  }
}

const initImages = (fileImages) => {
  if (!fileImages || !Array.isArray(fileImages)) return []

  return fileImages.map((img) => ({
    id: img.id || Date.now() + Math.random(),
    url: `https://back.love-kitchen.ru/web/uploads/${img.filename}`,
    nameUrl: img.filename,
    name: img.filename,
    isExisting: true,
  }))
}

const initVideo = (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) return null

  const videoFile = files[0]
  return {
    id: videoFile.id || Date.now() + Math.random(),
    url: `https://back.love-kitchen.ru/web/uploads/${videoFile.filename}`,
    nameUrl: videoFile.filename,
    name: videoFile.filename,
    isExisting: true,
  }
}

// Обработчик удаления видео
const handleVideoRemove = async (video) => {
  try {
    if (video.isExisting && video.nameUrl) {
      await deleteFile(video)
    }
    formData.value.video = null
  } catch (error) {
    console.error('Ошибка при удалении видео:', error)
  }
}

// Обработчик удаления изображения
const handleImageRemove = async (image) => {
  try {
    if (image.isExisting && image.nameUrl) {
      await deleteFile(image)
    }
    formData.value.images = formData.value.images.filter((img) => img.id !== image.id)
  } catch (error) {
    console.error('Ошибка при удалении изображения:', error)
  }
}

const initializeEditorData = () => {
  const itemData = currentItem.value || {}
  formData.value.title = itemData.Name || itemData.name || ''
  formData.value.description = itemData.description || ''
  formData.value.groupProduct = itemData.Group || null
  formData.value.groupAttribute = itemData.group_id || null
  formData.value.images = initImages(itemData.files?.filter((file) => file.type === 'photo'))
  formData.value.video = initVideo(itemData.files?.filter((file) => file.type === 'video'))

  if (itemData.attrs && Array.isArray(itemData.attrs)) {
    selectedAttributes.value = itemData.attrs.map((attr) => attr.id)
    console.log('Существующие атрибуты товара (IDs):', selectedAttributes.value)
  }
}

// Функция для автоматического определения группы атрибутов
const autoDetectAttributeGroup = () => {
  if (selectedAttributes.value.length > 0 && attributes.value.length > 0) {
    const attributeGroups = new Set()

    selectedAttributes.value.forEach((attrId) => {
      const attribute = attributes.value.find((attr) => attr.id === attrId)
      if (attribute && attribute.group_id) {
        attributeGroups.add(attribute.group_id)
      }
    })

    if (attributeGroups.size === 1) {
      const groupId = Array.from(attributeGroups)[0]
      formData.value.groupAttribute = groupId
      console.log('Автоматически определена группа атрибутов:', formData.value.groupAttribute)
    } else if (attributeGroups.size > 1) {
      console.log('Выбранные атрибуты принадлежат разным группам:', Array.from(attributeGroups))
      if (!formData.value.groupAttribute) {
        formData.value.groupAttribute = Array.from(attributeGroups)[0]
      }
    }
  }
}

// Назад к списку
const goBack = () => {
  router.push({ name: 'List', params: { pathName: name.value } })
}

// Lifecycle
onMounted(async () => {
  formData.value.type = name.value

  if (name.value === 'products') {
    await loadGroupsProducts()
    await loadGroupsAttributes()
    await loadAttributes()
  } else if (name.value === 'product-attributes') {
    await loadGroupsAttributes()
  }

  await loadItemData()

  if (name.value === 'products') {
    autoDetectAttributeGroup()
  }
})

// Отслеживание изменения параметров роута
watch([name, id], async () => {
  await loadItemData()
})

watch(
  attributes,
  (newAttributes) => {
    if (newAttributes.length > 0) {
      if (selectedAttributes.value.length > 0) {
        console.log('Проверка выбранных атрибутов:')
        selectedAttributes.value.forEach((attrId) => {
          const attribute = newAttributes.find((attr) => attr.id === attrId)
          console.log(`Атрибут ${attrId}:`, attribute ? `"${attribute.Name || attribute.name}"` : 'НЕ НАЙДЕН')
        })
      }
      autoDetectAttributeGroup()
    }
  },
  { deep: true }
)

watch(
  formData.value.images,
  (newImages) => {
    console.log('Images updated:', newImages)
  },
  { deep: true }
)

watch(
  () => formData.value.groupAttribute,
  (newGroupId) => {
    filterAttributesByGroup(newGroupId)
  }
)
</script>

<template>
  <!-- Кнопка назад -->
  <div class="back-button">
    <button @click="goBack" class="btn-back">
      <span class="btn-icon">←</span>
      Назад к списку
    </button>
  </div>

  <!-- Страница товаров -->
  <div v-if="name === 'products'" class="content-editor">
    <div class="editor-section">
      <h3 class="section-title">Основная информация</h3>
      <div class="form-grid">
        <div class="form-group">
          <label for="title" class="form-label">Наименование товара</label>
          <input
            type="text"
            id="title"
            v-model="formData.title"
            placeholder="Введите название товара"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="group" class="form-label">Категория товара</label>
          <div class="select-wrapper">
            <select id="group" v-model="formData.groupProduct" class="form-select">
              <option :value="null">Выберите категорию товара</option>
              <option v-for="group in groupsProduct" :key="group.id" :value="group.id">
                {{ group.Name || group.title }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="description" class="form-label">Описание</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Описание товара"
            class="form-textarea"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Блок атрибутов товара -->
    <div class="editor-section">
      <h3 class="section-title">Атрибуты товара</h3>

      <div class="attributes-container">
        <!-- Выбор группы атрибутов -->
        <div class="form-group">
          <label class="form-label">Группа атрибутов</label>
          <div class="select-wrapper">
            <select
              v-model="formData.groupAttribute"
              @change="filterAttributesByGroup(formData.groupAttribute)"
              class="form-select"
            >
              <option :value="null">Выберите группу атрибутов</option>
              <option v-for="group in groupsAttribute" :key="group.id" :value="group.id">
                {{ group.Name || group.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Выбор атрибутов из группы -->
        <div class="attributes-selector" v-if="filteredAttributes.length > 0">
          <label class="form-label">Доступные атрибуты</label>
          <div class="attributes-grid">
            <div v-for="attribute in filteredAttributes" :key="attribute.id" class="attribute-card">
              <label class="attribute-checkbox">
                <input
                  type="checkbox"
                  :value="attribute.id"
                  v-model="selectedAttributes"
                  :checked="selectedAttributes.includes(attribute.id)"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="attribute-name">{{ attribute.Name || attribute.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Список выбранных атрибутов -->
        <div class="selected-attributes-section" v-if="selectedAttributes.length > 0">
          <div class="selected-header">
            <h4 class="selected-title">Выбранные атрибуты</h4>
            <span class="selected-count">{{ selectedAttributes.length }}</span>
          </div>
          <div class="selected-attributes-grid">
            <div v-for="attributeId in selectedAttributes" :key="attributeId" class="selected-attribute-card">
              <div class="attribute-badge">
                <span class="badge-text">{{ getAttributeName(attributeId) }}</span>
                <button @click="removeAttributeFromProduct(attributeId)" class="badge-remove" title="Удалить атрибут">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Блок медиа товара -->
    <div class="editor-section">
      <h3 class="section-title">Изображения</h3>
      <div class="attributes-container">
        <div class="form-group">
          <DragDropImages v-model="formData.images" :multiple="true" @remove-image="handleImageRemove" />
        </div>
      </div>
    </div>

    <!-- Блок видео товара -->
    <div class="editor-section">
      <h3 class="section-title">Видео</h3>
      <div class="attributes-container">
        <div class="form-group">
          <AdminAddVideo v-model="formData.video" @remove-video="handleVideoRemove" />
        </div>
      </div>
    </div>

    <!-- Кнопки действий -->
    <div class="action-buttons">
      <button @click="saveContent" class="btn-primary">
        <span class="btn-icon">💾</span>
        {{ id === 'new' ? 'Создать товар' : 'Сохранить товар' }}
      </button>
      <button @click="getContent" class="btn-secondary">
        <span class="btn-icon">🧪</span>
        Тест
      </button>
    </div>
  </div>

  <!-- Страница групп товаров -->
  <div v-if="name === 'product-groups'" class="content-editor">
    <div class="editor-section">
      <h3 class="section-title">Группа товаров</h3>
      <div class="form-single">
        <div class="form-group">
          <label for="title" class="form-label">Название группы</label>
          <input
            type="text"
            id="title"
            v-model="formData.title"
            placeholder="Введите название группы товаров"
            class="form-input"
          />
          <div class="form-hint">Например: Электроника, Одежда, Мебель и т.д.</div>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button @click="saveContent" class="btn-primary">
        <span class="btn-icon">💾</span>
        {{ id === 'new' ? 'Создать группу' : 'Сохранить группу' }}
      </button>
      <button @click="getContent" class="btn-secondary">
        <span class="btn-icon">🔍</span>
        Проверить данные
      </button>
    </div>
  </div>

  <!-- Страница групп атрибутов -->
  <div v-if="name === 'product-attribute-groups'" class="content-editor">
    <div class="editor-section">
      <h3 class="section-title">Группа атрибутов</h3>
      <div class="form-single">
        <div class="form-group">
          <label for="title" class="form-label">Название группы атрибутов</label>
          <input
            type="text"
            id="title"
            v-model="formData.title"
            placeholder="Введите название группы атрибутов"
            class="form-input"
          />
          <div class="form-hint">Например: Цвет, Размер, Материал и т.д.</div>
        </div>
      </div>
    </div>
    <div class="action-buttons">
      <button @click="saveContent" class="btn-primary">
        <span class="btn-icon">💾</span>
        {{ id === 'new' ? 'Создать группу атрибутов' : 'Сохранить группу атрибутов' }}
      </button>
      <button @click="getContent" class="btn-secondary">
        <span class="btn-icon">🔍</span>
        Проверить данные
      </button>
    </div>
  </div>

  <!-- Страница атрибутов -->
  <div v-if="name === 'product-attributes'" class="content-editor">
    <div class="editor-section">
      <h3 class="section-title">Атрибут товара</h3>
      <div class="form-grid">
        <div class="form-group">
          <label for="title" class="form-label">Название атрибута</label>
          <input
            type="text"
            id="title"
            v-model="formData.title"
            placeholder="Введите название атрибута"
            class="form-input"
          />
          <div class="form-hint">Например: Красный, XL, Хлопок и т.д.</div>
        </div>

        <div class="form-group">
          <label for="group" class="form-label">Группа атрибутов</label>
          <div class="select-wrapper">
            <select id="group" v-model="formData.groupAttribute" class="form-select">
              <option :value="null">Выберите группу атрибутов</option>
              <option v-for="group in groupsAttribute" :key="group.id" :value="group.id">
                {{ group.Name || group.name }}
              </option>
            </select>
          </div>
          <div class="form-hint">Выберите к какой группе относится этот атрибут</div>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button @click="saveContent" class="btn-primary">
        <span class="btn-icon">💾</span>
        {{ id === 'new' ? 'Создать атрибут' : 'Сохранить атрибут' }}
      </button>
      <button @click="getContent" class="btn-secondary">
        <span class="btn-icon">🔍</span>
        Проверить данные
      </button>
    </div>
  </div>
</template>

<style scoped>
.back-button {
  margin-bottom: 20px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-back:hover {
  background: #4b5563;
}

.content-editor {
  max-width: 100%;
  padding: 0;
}

/* Общие стили секций */
.editor-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e5e9;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f2f5;
}

/* Сетки форм */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-single {
  max-width: 500px;
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
  line-height: 1.4;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #dba250;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: none;
  min-height: 100px;
  font-family: inherit;
}

.select-wrapper {
  position: relative;
}

/* Стили для атрибутов */
.attributes-container {
  space-y: 24px;
}

.attributes-selector {
  margin-top: 16px;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.attribute-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.attribute-card:hover {
  border-color: #dba250;
  background: #f0f9ff;
}

.attribute-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin: 0;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-custom {
  background: #dba250;
  border-color: #dba250;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 12px;
  font-weight: bold;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.attribute-name {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

/* Выбранные атрибуты */
.selected-attributes-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #f0f2f5;
}

.selected-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.selected-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.selected-count {
  background: #dba250;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.selected-attributes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attribute-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #dba250;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.badge-text {
  line-height: 1;
}

.badge-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.badge-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Состояние пустого списка */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  margin: 0;
}

/* Кнопки действий */
.action-buttons {
  display: flex;
  gap: 12px;
  padding: 24px 0;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #dba250;
  color: white;
}

.btn-primary:hover {
  background: #fbaf45;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(246, 184, 59, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 16px;
}
</style>

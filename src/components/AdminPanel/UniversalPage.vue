<script setup>
import axios from 'axios'
import { ref, computed, onMounted, watch } from 'vue'
import { useDefaultItems } from '@/stores/default'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import DragDropImages from '@/components/UI/DragDropImages.vue'
// import AdminCalendar from '@/components/UI/AdminCalendar.vue'
import AdminAddVideo from '../UI/AdminAddVideo.vue'

const store = useDefaultItems()
const token = store.getBearer
const headersPost = {
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: 'Bearer ' + token,
  },
}
const headersGet = {
  headers: {
    Authorization: 'Bearer ' + token,
  },
}

// Пропсы
const props = defineProps({
  propsPage: String,
  item: Object,
})

// Реактивные переменные
// const timestampPublish = ref(null)

// форма отправки
const formData = ref({
  // Тип станицы
  type: '',
  // Заголовок
  title: '',
  // Ссылка на видео
  video: null,
  images: [],
  description: '',
  groupProduct: '',
  groupAttribute: '',
})
const groupsProduct = ref([])
const groupsAttribute = ref([])
const attributes = ref([]) // все атрибуты (черный, красный и т.д.)
const filteredAttributes = ref([]) // атрибуты отфильтрованные по выбранной группе
const selectedAttributes = ref([]) // выбранные атрибуты для товара
const imagesSrc = ref([])
const videoSrc = ref(null)

// Computed
// const disabledDates = computed(() => {
//   const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
//   return [{ start: null, end: yesterday }]
// })
// Methods
const useMultiUploadImages = async () => {
  const srcImages = []

  for (const img of formData.value.images) {
    if (img.isExisting) {
      srcImages.push(img.url)
      continue
    }
    const newFormData = new FormData()
    newFormData.append('UploadForm[file]', img.file)
    newFormData.append('folder', `products/${props.item?.id || 'temp'}`)
    newFormData.append('filenamePrefix', 'product_')

    try {
      const response = await axios.post(`${store.getApiDomain}/uploads/file`, newFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + token,
        },
      })
      srcImages.push(response.data)
      console.log('Изображение загружено:', response.data)
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error)
      throw new Error(`Ошибка при загрузке фото: ${error.message}`)
    }
  }

  return srcImages
}
const useUploadVideo = async () => {
  const newFormData = new FormData()
  newFormData.append('UploadForm[file]', formData.value.video.file)
  newFormData.append('folder', `products/${props.item?.id || 'temp'}`)
  newFormData.append('filenamePrefix', 'product_')
  try {
    const response = await axios.post(`${store.getApiDomain}/uploads/file`, newFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token,
      },
    })
    console.log('Видео загружено:', response.data)
    return response.data
  } catch (error) {
    console.error('Ошибка загрузки видео:', error)
    throw new Error(`Ошибка при загрузке видео: ${error.message}`)
  }
}
const productToFile = async (fileNames, type) => {
  if (!props.item?.id) {
    throw new Error('ID товара не найден')
  }
  console.log('fileNames', fileNames)
  // type = 'photo' || 'video'
  const createConnection = async (filename, type) => {
    try {
      const newFormData = new FormData()
      newFormData.append('product_id', props.item.id)
      newFormData.append('type', type)
      newFormData.append('filename', filename)

      const response = await axios.post(`${store.getApiDomain}/product-to-files`, newFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + token,
        },
      })

      console.log('Файл связан с товаром:', response.data)
      return response.data
    } catch (error) {
      console.error('Ошибка связи файла с товаром:', error)
      throw new Error(`Ошибка связи файла с товаром: ${error.message}`)
    }
  }

  if (Array.isArray(fileNames) && fileNames.length > 0) {
    const results = []
    for (const imgUrl of fileNames) {
      console.log(imgUrl)
      const res = await createConnection(imgUrl, type)
      if (res) results.push(res)
    }
    console.log('images', results)
    return results
  } else if (fileNames) {
    const res = await createConnection(fileNames, type)
    console.log('video', res)
    if (res) return res
  }
}

// Фильтрация атрибутов по выбранной группе
const filterAttributesByGroup = (groupId) => {
  if (!groupId) {
    filteredAttributes.value = []
    return
  }
  filteredAttributes.value = attributes.value.filter((attr) => attr.group_id === groupId)
  console.log('Отфильтрованные атрибуты:', filteredAttributes.value)
}

// Загрузка всех атрибутов
const loadAttributes = async () => {
  try {
    const response = await axios.get(`${store.getApiDomain}/product-attributes`, headersGet)
    attributes.value = response.data || []
    console.log('Загруженные атрибуты:', attributes.value)
  } catch (error) {
    console.error('Ошибка загрузки атрибутов:', error)
  }
}
// Загрузка атрибутов товара
// const loadProductAttributes = async () => {
//   try {
//     const response = await axios.get(`${store.getApiDomain}/product-attributes-values/${props.item.id}`, headersGet)
//     // Предполагаем структуру ответа API
//     selectedAttributes.value = response.data.map((attr) => attr.attribute_id) || []
//     console.log('Привязанные атрибуты товара:', selectedAttributes.value)
//   } catch (error) {
//     console.error('Ошибка загрузки атрибутов товара:', error)
//   }
// }
// Получение названия атрибута по ID
const getAttributeName = (attributeId) => {
  const attribute = attributes.value.find((attr) => attr.id === attributeId)
  return attribute?.Name || attribute?.name || 'Неизвестный атрибут'
}

// Удаление атрибута из товара
const removeAttributeFromProduct = (attributeId) => {
  selectedAttributes.value = selectedAttributes.value.filter((id) => id !== attributeId)
}

// Methods
const loadGroupsProducts = async () => {
  try {
    const response = await axios.get(`${store.getApiDomain}/product-groups`, headersGet)
    groupsProduct.value = response.data || []
    console.log('Загруженные группы:', groupsProduct.value)
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
}
const loadGroupsAttributes = async () => {
  try {
    const response = await axios.get(`${store.getApiDomain}/product-attribute-groups`, headersGet)
    groupsAttribute.value = response.data || []
    console.log('Загруженные группы:', groupsAttribute.value)
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
}
// Сохранение контента
const saveContent = async () => {
  try {
    // 1. Загружаем изображения
    if (formData.value.images.length > 0) {
      imagesSrc.value = await useMultiUploadImages()
      console.log('Загруженные изображения:', imagesSrc.value)
    }
    // 2. Загружаем video
    if (formData.value.video) {
      videoSrc.value = await useUploadVideo()
      console.log('Загруженные видео:', videoSrc.value)
    }
    // 3. Связываем изображения с товаром
    if (imagesSrc.value.length > 0 && props.item?.id) {
      await productToFile(imagesSrc.value, 'photo')
      formData.value.images = formData.value.images.map((img, index) => ({
        id: img.id,
        url: `https://back.love-kitchen.ru/web/uploads/${imagesSrc.value[index]}`,
        nameUrl: imagesSrc.value[index],
        name: img.file.name,
        isExisting: true,
      }))
      console.log('Изображения связаны с товаром', imagesSrc.value)
    }
    // 4. Связываем video с товаром
    if (videoSrc.value && props.item?.id) {
      await productToFile(videoSrc.value, 'video')
      formData.value.video = videoSrc.value
      console.log('Видео связано с товаром')
    }
    let newObject, link
    if (props.propsPage === 'products') {
      newObject = {
        ...props.item,
        Name: formData.value.title,
        description: formData.value.description,
        Group: formData.value.groupProduct,
        attrs: selectedAttributes.value,
      }
      link = `${store.getApiDomain}/${props.propsPage}/${props.item.id}`
    } else if (props.propsPage === 'product-groups') {
      newObject = {
        ...props.item,
        Name: formData.value.title,
      }
      link = `${store.getApiDomain}/${props.propsPage}`
    } else if (props.propsPage === 'product-attribute-groups') {
      newObject = {
        ...props.item,
        name: formData.value.title,
      }
      link = `${store.getApiDomain}/${props.propsPage}`
    } else if (props.propsPage === 'product-attributes') {
      newObject = {
        ...props.item,
        name: formData.value.title,
        group_id: formData.value.groupAttribute,
      }
      link = `${store.getApiDomain}/${props.propsPage}`
    }

    console.log(link)
    let response
    if (props.propsPage === 'products') {
      response = await axios.patch(link, newObject, headersPost)
    } else {
      response = await axios.post(link, newObject, headersPost)
    }
    // const response = await axios.get(link, {
    //   headers: headersGet,
    // })
    const data = response.data
    console.log(data)

    toast.success('Товар сохранен', { autoClose: 1000 })
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    toast.error(`Ошибка сохранения: ${error.message}`, { autoClose: 1000 })
  }

  return
}

const getContent = async () => {
  console.log(formData.value)
  // const link = `https://back.love-kitchen.ru/web/index.php/product-to-files/${props.item.id}`
  // try {
  //   const response = await axios.get(link, headersGet)
  //   const data = response.data
  //   console.log(data)
  // } catch (error) {
  //   console.error(error)
  // }
}

const initializeEditorData = () => {
  const itemData = props.item || {}

  formData.value.title = itemData.Name || itemData.name || ''
  formData.value.description = itemData.description || ''
  formData.value.groupProduct = itemData.Group || null
  formData.value.groupAttribute = itemData.group_id || null
  formData.value.images = itemData.images || []

  // formData.value.videoUrl = itemData.videoUrl

  // if (itemData.date_publication) {
  //   timestampPublish.value = itemData.date_publication * 1000
  // }
}
// Lifecycle
onMounted(async () => {
  console.log(props.item)
  formData.value.type = props.propsPage
  if (props.propsPage === 'products') {
    await loadGroupsProducts()
    await loadGroupsAttributes() // Загружаем группы атрибутов
    await loadAttributes() // Загружаем все атрибуты
    // Загружаем уже привязанные атрибуты товара
    // if (props.item?.id) {
    //   await loadProductAttributes()
    // }
  }
  if (props.propsPage === 'product-attributes') await loadGroupsAttributes()
  initializeEditorData()
})

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

<!-- <AdminCalendar v-if="propsPage === 'products'" v-model="timestampPublish" :disabled-dates="disabledDates" /> -->
<!-- Images -->
<!-- <div class="form-group">
  <label>Изображение</label>
  <DragDropImages v-model="formData.images" :multiple="propsPage === 'products'" />
</div> -->
<!-- url video -->
<!-- <div v-if="propsPage === 'products'" class="form-group">
  <label>Видео</label>
  <AdminAddVideo v-model="formData.video" />
</div> -->
<template>
  <!-- Страница товаров -->
  <div v-if="propsPage === 'products'" class="content-editor">
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
        <!-- Выбор группы атрибутов -->
        <div class="form-group">
          <DragDropImages v-model="formData.images" :multiple="propsPage === 'products'" />
        </div>
      </div>
    </div>
    <!-- Блок видео товара -->
    <div class="editor-section">
      <h3 class="section-title">Видео</h3>

      <div class="attributes-container">
        <!-- Выбор группы атрибутов -->
        <div class="form-group">
          <AdminAddVideo v-model="formData.video" />
        </div>
      </div>
    </div>

    <!-- Кнопки действий -->
    <div class="action-buttons">
      <button @click="saveContent" class="btn-primary">
        <span class="btn-icon">💾</span>
        Сохранить товар
      </button>
      <button @click="getContent" class="btn-secondary">
        <span class="btn-icon">🧪</span>
        Тест
      </button>
    </div>
  </div>

  <!-- Страница групп товаров -->
  <div v-if="propsPage === 'product-groups'" class="content-editor">
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
        Сохранить группу
      </button>
      <button @click="getContent" class="btn-secondary">
        <span class="btn-icon">🔍</span>
        Проверить данные
      </button>
    </div>
  </div>

  <!-- Страница групп атрибутов -->
  <div v-if="propsPage === 'product-attribute-groups'" class="content-editor">
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
        Сохранить группу атрибутов
      </button>
      <button @click="getContent" class="btn-secondary">
        <span class="btn-icon">🔍</span>
        Проверить данные
      </button>
    </div>
  </div>

  <!-- Страница атрибутов -->
  <div v-if="propsPage === 'product-attributes'" class="content-editor">
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
        Сохранить атрибут
      </button>
      <button @click="getContent" class="btn-secondary">
        <span class="btn-icon">🔍</span>
        Проверить данные
      </button>
    </div>
  </div>
</template>
<style scoped>
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

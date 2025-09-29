<script setup>
import axios from 'axios'
import { ref, computed, onMounted, watch } from 'vue'
import { useDefaultItems } from '@/stores/default'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
// import DragDropImages from '@/components/UI/DragDropImages.vue'
// import AdminCalendar from '@/components/UI/AdminCalendar.vue'
// import AdminAddVideo from '../UI/AdminAddVideo.vue'

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
  // video: null,
  // images: [],
  descr: '',
  groupProduct: '',
  groupAttribute: '',
})
const groupsProduct = ref([])
const groupsAttribute = ref([])
// const imagesSrc = ref([])
// const videoSrc = ref(null)

// Computed
// const disabledDates = computed(() => {
//   const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
//   return [{ start: null, end: yesterday }]
// })
// Methods
// const useMultiUploadImages = async () => {
//   const srcImages = []

//   for (const img of formData.value.images) {
//     if (img.isExisting) {
//       srcImages.push(img.url)
//       continue
//     }
//     const newFormData = new FormData()
//     newFormData.append('UploadForm[file]', img.file)
//     newFormData.append('folder', `products/${props.item?.id || 'temp'}`)
//     newFormData.append('filenamePrefix', 'product_')

//     try {
//       const response = await axios.post(`${store.getApiDomain}/uploads/file`, newFormData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: 'Bearer ' + token,
//         },
//       })
//       srcImages.push(response.data)
//       console.log('Изображение загружено:', response.data)
//     } catch (error) {
//       console.error('Ошибка загрузки изображения:', error)
//       throw new Error(`Ошибка при загрузке фото: ${error.message}`)
//     }
//   }

//   return srcImages
// }
// const useUploadVideo = async () => {
//   const newFormData = new FormData()
//   newFormData.append('UploadForm[file]', formData.value.video.file)
//   newFormData.append('folder', `products/${props.item?.id || 'temp'}`)
//   newFormData.append('filenamePrefix', 'product_')
//   try {
//     const response = await axios.post(`${store.getApiDomain}/uploads/file`, newFormData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         Authorization: 'Bearer ' + token,
//       },
//     })
//     console.log('Видео загружено:', response.data)
//     return response.data
//   } catch (error) {
//     console.error('Ошибка загрузки видео:', error)
//     throw new Error(`Ошибка при загрузке видео: ${error.message}`)
//   }
// }
// const productToFile = async (fileNames, type) => {
//   if (!props.item?.id) {
//     throw new Error('ID товара не найден')
//   }
//   console.log('fileNames', fileNames)
//   // type = 'photo' || 'video'
//   const createConnection = async (filename, type) => {
//     try {
//       const newFormData = new FormData()
//       newFormData.append('product_id', props.item.id)
//       newFormData.append('type', type)
//       newFormData.append('filename', filename)

//       const response = await axios.post(`${store.getApiDomain}/product-to-files`, newFormData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: 'Bearer ' + token,
//         },
//       })

//       console.log('Файл связан с товаром:', response.data)
//       return response.data
//     } catch (error) {
//       console.error('Ошибка связи файла с товаром:', error)
//       throw new Error(`Ошибка связи файла с товаром: ${error.message}`)
//     }
//   }

//   if (Array.isArray(fileNames) && fileNames.length > 0) {
//     const results = []
//     for (const imgUrl of fileNames) {
//       console.log(imgUrl)
//       const res = await createConnection(imgUrl, type)
//       if (res) results.push(res)
//     }
//     console.log('images', results)
//     return results
//   } else if (fileNames) {
//     const res = await createConnection(fileNames, type)
//     console.log('video', res)
//     if (res) return res
//   }
// }

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
    // // 1. Загружаем изображения
    // if (formData.value.images.length > 0) {
    //   imagesSrc.value = await useMultiUploadImages()
    //   console.log('Загруженные изображения:', imagesSrc.value)
    // }
    // // 2. Загружаем video
    // if (formData.value.video) {
    //   videoSrc.value = await useUploadVideo()
    //   console.log('Загруженные видео:', videoSrc.value)
    // }
    // // 3. Связываем изображения с товаром
    // if (imagesSrc.value.length > 0 && props.item?.id) {
    //   await productToFile(imagesSrc.value, 'photo')
    //   formData.value.images = formData.value.images.map((img, index) => ({
    //     id: img.id,
    //     url: `https://back.love-kitchen.ru/web/uploads/${imagesSrc.value[index]}`,
    //     nameUrl: imagesSrc.value[index],
    //     name: img.file.name,
    //     isExisting: true,
    //   }))
    //   console.log('Изображения связаны с товаром', imagesSrc.value)
    // }
    // // 4. Связываем video с товаром
    // if (videoSrc.value && props.item?.id) {
    //   await productToFile(videoSrc.value, 'video')
    //   formData.value.video = videoSrc.value
    //   console.log('Видео связано с товаром')
    // }
    let newObject, link
    if (props.propsPage === 'products') {
      newObject = {
        ...props.item,
        Name: formData.value.title,
        descr: formData.value.descr,
        Group: formData.value.groupProduct,
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
    const response = await axios.post(link, newObject, headersPost)
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
  formData.value.descr = itemData.descr || ''
  formData.value.groupProduct = itemData.Group || null
  formData.value.groupAttribute = itemData.group_id || null
  // formData.value.images = itemData.images || []

  // formData.value.videoUrl = itemData.videoUrl

  // if (itemData.date_publication) {
  //   timestampPublish.value = itemData.date_publication * 1000
  // }
}
// Lifecycle
onMounted(async () => {
  console.log(props.item)
  formData.value.type = props.propsPage
  if (props.propsPage === 'products') await loadGroupsProducts()
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
</script>

<template>
  <div v-if="propsPage === 'products'" class="content-editor">
    <!-- Calendar -->
    <!-- <AdminCalendar v-if="propsPage === 'products'" v-model="timestampPublish" :disabled-dates="disabledDates" /> -->
    <!-- Title -->
    <div class="form-group">
      <label for="title">Наименование</label>
      <input type="text" id="title" v-model="formData.title" placeholder="Название" />
    </div>
    <div class="form-group">
      <label for="descr">Описание</label>
      <textarea type="text" id="descr" v-model="formData.descr" placeholder="Описание"></textarea>
    </div>
    <div class="form-group">
      <label for="group">Категория товара</label>
      <select id="group" v-model="formData.groupProduct">
        <option :value="null">Выберите категорию товара</option>
        <option v-for="group in groupsProduct" :key="group.id" :value="group.id">
          {{ group.Name || group.title }}
        </option>
      </select>
    </div>
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
    <!-- Save Button -->
    <button @click="saveContent" class="btn-white">Сохранить</button>
    <button @click="getContent" class="btn-white">тест</button>
  </div>
  <div v-if="propsPage === 'product-groups'" class="content-editor">
    <!-- Title -->
    <div class="form-group">
      <label for="title">Наименование</label>
      <input type="text" id="title" v-model="formData.title" placeholder="Название" />
    </div>
    <!-- Save Button -->
    <button @click="saveContent" class="btn-white">Сохранить</button>
    <button @click="getContent" class="btn-white">тест</button>
  </div>
  <div v-if="propsPage === 'product-attribute-groups'" class="content-editor">
    <!-- Title -->
    <div class="form-group">
      <label for="title">Наименование</label>
      <input type="text" id="title" v-model="formData.title" placeholder="Название" />
    </div>
    <!-- Save Button -->
    <button @click="saveContent" class="btn-white">Сохранить</button>
    <button @click="getContent" class="btn-white">тест</button>
  </div>
  <div v-if="propsPage === 'product-attributes'" class="content-editor">
    <!-- Title -->
    <div class="form-group">
      <label for="title">Наименование</label>
      <input type="text" id="title" v-model="formData.title" placeholder="Название" />
    </div>
    <div class="form-group">
      <label for="group">Группа атрибутов</label>
      <select id="group" v-model="formData.groupAttribute">
        <option :value="null">Выберите группу товара</option>
        <option v-for="group in groupsAttribute" :key="group.id" :value="group.id">
          {{ group.Name || group.name }}
        </option>
      </select>
    </div>
    <!-- Save Button -->
    <button @click="saveContent" class="btn-white">Сохранить</button>
    <button @click="getContent" class="btn-white">тест</button>
  </div>
</template>

<style lang="scss" scoped>
#fileNews {
  display: none;
}
.content-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 0 40px 0;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
label {
  font-weight: 600;
  font-size: 16px;
  line-height: 18px;
  color: #333;
}
input,
textarea,
select {
  background: #f1f1f1;
  border: 1px solid #ccc;
  padding: 5px;
  min-height: 34px;
}
select {
  cursor: pointer;
}
textarea {
  min-height: 100px;
  resize: none;
}
/* Basic editor styles */

.button-group {
  display: flex;
  gap: 10px;
}
.button-group button,
.button-group label {
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: 0.3s;
}
.button-group button.is-active {
  background: #5f22c16c;
}
</style>

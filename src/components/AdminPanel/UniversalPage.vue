<script setup>
import axios from 'axios'
import { ref, computed, onMounted, watch } from 'vue'
import { useMultiUploadImages } from '@/helpers/useMultiUploadImages'
import { useDefaultItems } from '@/stores/default'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import DragDropImages from '@/components/UI/DragDropImages.vue'
import AdminCalendar from '@/components/UI/AdminCalendar.vue'

const store = useDefaultItems()
const token = store.getBearer

// Пропсы
const props = defineProps({
  propsPage: String,
  item: Object,
  modelValue: String,
})

// Эмиты
defineEmits(['update:modelValue'])

// Реактивные переменные
const timestampPublish = ref(null)

// форма отправки
const formData = ref({
  // Тип станицы
  type: 'text',
  // Заголовок
  title: '',
  // Ссылка на видео
  video: '',

  text: props.modelValue || '',
})

// массив загрузки картинок
const images = ref([])
const imagesSrc = ref([])

// Computed

const disabledDates = computed(() => {
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
  return [{ start: null, end: yesterday }]
})

// Methods
// const uploadImages = useMultiUploadImages(`uploads/file`, token, props.item.id, images.value)
// const uploadImages = async () => {
//   const endpoint = `https://back.love-kitchen.ru/web/index.php/uploads/file`
//   images.value.forEach(async (img) => {
//     let newFormData = new FormData()
//     newFormData.append('UploadForm[file]', img.file)
//     newFormData.append('folder', `products/${props.item.id}`)
//     newFormData.append('filenamePrefix', 'product_')

//     try {
//       let resImg = await axios.post(endpoint, newFormData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: 'Bearer ' + token,
//         },
//       })
//       console.log('resImg: ', resImg)
//     } catch (error) {
//       console.error('Ошибка:', error)
//       alert('Ошибка при загрузке фото. Попробуйте еще раз.')
//     }
//   })
// }

// Сохранение контента
const saveContent = async () => {
  imagesSrc.value = await useMultiUploadImages(`uploads/file`, token, props.item.id, images.value)
  if (imagesSrc.value && imagesSrc.value.length > 0) console.log(imagesSrc.value)
  return
  try {
    const endpoint = `https://api.24pteam.ru/web/index.php/uploads`
    const params = buildParams()

    await makeRequest(endpoint, params, 'post')
    toast.success('Сохранено', { autoClose: 1000 })
  } catch (error) {
    toast.error(`Произошла ошибка: ${error}`, { autoClose: 1000 })
  }
}

const buildParams = () => {
  const baseParams = {
    title: formData.value.title,
    date_add: new Date(),
    pic: imagesSrc.value,
    date_publication: timestampPublish.value ? Math.floor(timestampPublish.value / 1000) : null,
    ...(props.item && { id: props.item.id }),
  }

  return baseParams
}

const initializeEditorData = () => {
  const itemData = props.item || {}

  formData.value.title = itemData.Name
  formData.value.videoUrl = itemData.videoUrl

  if (itemData.pic && itemData.pic.length > 0) {
    images.value = itemData.pic.map((pic, index) => ({
      id: `existing-${index}-${Date.now}`,
      url: pic,
      file: null,
      isExisting: true,
    }))
  }

  if (itemData.date_publication) {
    timestampPublish.value = itemData.date_publication * 1000
  }
}
// Lifecycle
onMounted(async () => {
  formData.value.type = props.propsPage
  initializeEditorData()
})

watch(
  images,
  (newImages) => {
    console.log('Images updated:', newImages)
  },
  { deep: true }
)
</script>

<template>
  <div class="content-editor">
    <!-- Calendar -->
    <AdminCalendar v-model="timestampPublish" :disabled-dates="disabledDates" />
    <!-- Title -->
    <div class="form-group">
      <label for="title">Наименование</label>
      <input type="text" v-model="formData.title" placeholder="Название" />
    </div>
    <!-- Images -->
    <DragDropImages v-model="images" />
    <!-- url video -->
    <div class="form-group">
      <label>Ссылка на видео</label>
      <input v-model="formData.videoUrl" placeholder="Вставьте ссылку" />
    </div>
    <!-- Save Button -->
    <button @click="saveContent" class="btn-white">Сохранить</button>
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

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useDefaultItems } from '@/stores/default'
import axios from 'axios'

import VCalendar from 'v-calendar'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import 'v-calendar/style.css'

// Пропсы
const props = defineProps({
  propsPage: {
    type: String,
  },
  item: {
    type: Object,
    required: false,
  },
  modelValue: String,
})

// Эмиты
// const emit = defineEmits(['update:modelValue'])

// Получаем данные из Vuex

const store = useDefaultItems()
const user = computed(() => store.getUser)
const apiUrl = computed(() => store.getApiUrl)
const apiDomain = computed(() => store.getApiDomain)

// Реактивные переменные
const isCalendarVisible = ref(false)
const dateRange = ref(null)
const timestampPublish = ref(null)
const formattedDate = ref('Выберите дату')
const attributes = ref([
  {
    highlight: true,
    dates: new Date(),
  },
])
const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
const disabledDates = ref([{ start: null, end: yesterday }])
const testData = ref(null)
const formData = reactive({
  image: '',
  text: props.modelValue || '',
  theme: '',
  type: 'text',
  shortText: '',
  audio: '',
  videoUrl: '',
  categorieId: '',
  title: '',
  link: '',
})
const itemData = ref({})
const srcPhoto = ref(null)
const dopBannerSrc = ref(null)
const dopBannerSrc2 = ref(null)
const headerBannerSrc = ref(null)
const dopQuote = ref('')
const themesReset = ref([])
const categoriesReset = ref([])
const bloggerReset = ref([])
const bloggerId = ref(null)
const sort = ref(0)
const flagCategry = ref(false)
const editor = ref(null)

// Функция обработки изменения даты
const handleDateChange = (timestamp = false) => {
  if (timestamp) {
    const date = new Date(timestamp)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    formattedDate.value = `${day}.${month}.${year}`
  }
  if (dateRange.value) {
    const date = new Date(dateRange.value)
    formattedDate.value = date
      .toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '.')
    timestampPublish.value = date.getTime()
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
  }
}

// Переключение видимости календаря
const toggleCalendar = () => {
  isCalendarVisible.value = !isCalendarVisible.value
}

// Загрузка изображения
const handleImageUpload = async (event) => {
  try {
    await uploadPhoto(event, false, false, false, true)
    const imageUrl = formData.image
    editor.value
      .chain()
      .focus()
      .setImage({ src: `${apiDomain.value}/web/uploads/${imageUrl}` })
      .run()
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error)
    alert('Ошибка при загрузке изображения. Попробуйте снова.')
  }
}

// Добавление изображения через URL
// const addImage = () => {
//   const url = window.prompt('URL')
//   if (url) {
//     editor.value.chain().focus().setImage({ src: url }).run()
//   }
// }

// Загрузка фото
const uploadPhoto = async (event, dopBanner = false, headerBanner = false, dopBanner2 = false, content = false) => {
  let file
  if (headerBanner) {
    file = document.getElementById('headerBanner')?.files[0]
  } else if (dopBanner) {
    file = document.getElementById('dopBanner')?.files[0]
  } else if (dopBanner2) {
    file = document.getElementById('dopBanner2')?.files[0]
  } else {
    file = event.target.files[0]
  }

  if (!file) return

  const validFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  if (!validFileTypes.includes(file.type)) {
    alert('Можно загружать только файлы формата JPG, PNG, GIF, WEBP или SVG.')
    return
  }

  const uploadFormData = new FormData()
  uploadFormData.append('UploadForm[file]', file)
  uploadFormData.append('folder', 'users/avatar')
  uploadFormData.append('filenamePrefix', 'avatar_')

  const authGet = `&auth=${user.value.username}:${user.value.auth_key}`

  try {
    const response = await axios.post(`${apiUrl.value}upload${authGet}`, uploadFormData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (dopBanner) dopBannerSrc.value = response.data
    else if (headerBanner) headerBannerSrc.value = response.data
    else if (dopBanner2) dopBannerSrc2.value = response.data
    else if (content) formData.image = response.data
    else srcPhoto.value = response.data
  } catch (error) {
    console.error('Ошибка:', error)
    alert('Ошибка при загрузке фото. Попробуйте еще раз.')
  }
}

// Получение категорий
const getCategories = async () => {
  if (!flagCategry.value && !['news', 'theme', 'notify', 'blogger'].includes(props.propsPage)) {
    const authGet = `&auth=${user.value.username}:${user.value.auth_key}`
    try {
      const response = await axios.get(`${apiUrl.value}api-${props.propsPage}-category/get-list${authGet}`)
      categoriesReset.value = response.data.categories
    } catch (error) {
      console.error('Ошибка получения категорий:', error)
    }
  }
}

// Получение блогеров
const getBloggers = async () => {
  const authGet = `&auth=${user.value.username}:${user.value.auth_key}`
  try {
    const response = await axios.get(`${apiUrl.value}api-blogger/get-list${authGet}`)
    bloggerReset.value = response.data.bloggers
  } catch (error) {
    console.error('Ошибка получения блогеров:', error)
  }
}

// Сохранение контента
const saveContent = async () => {
  const authGet = `&auth=${user.value.username}:${user.value.auth_key}`
  let params = {}

  if (flagCategry.value) {
    params = {
      name: formData.title,
      description: formData.shortText,
    }
    if (props.item) params.id = props.item.id
    try {
      await axios.post(`${apiUrl.value}api-${props.propsPage}/${props.item ? 'update' : 'set'}${authGet}`, params)
      toast.success('Сохранено', { autoClose: 1000 })
    } catch (error) {
      toast.error(`Произошла ошибка: ${error}`, { autoClose: 1000 })
    }
    return
  }

  if (props.propsPage === 'products') {
    console.log(props.propsPage)
    params = {
      theme_id: formData.theme,
      category_id: formData.categorieId,
      title: formData.title,
      description: formData.shortText,
      link: formData.audio,
      date_add: new Date(),
      pic: srcPhoto.value,
      sort: sort.value,
      date_publication: timestampPublish.value / 1000,
    }
  }

  if (props.item) params.id = props.item.id

  try {
    await axios.post(`${apiUrl.value}api-${props.propsPage}/${props.item ? 'update' : 'set'}${authGet}`, params)
    toast.success('Сохранено', { autoClose: 1000 })
  } catch (error) {
    toast.error(`Произошла ошибка: ${error}`, { autoClose: 1000 })
  }
}

// Получение тем
const getThemes = async () => {
  const authGet = `&auth=${user.value.username}:${user.value.auth_key}`
  try {
    const response = await axios.get(`${apiUrl.value}api-theme/get-list${authGet}`)
    themesReset.value = response.data.themes
  } catch (error) {
    console.error('Ошибка получения тем:', error)
  }
}

// Сохранение теста
const handleSaveTest = (test) => {
  testData.value = test
  toast.success('Тест сохранен', { autoClose: 1000 })
}

// Отправка теста на сервер
const sendToServer = async () => {
  const authGet = `&auth=${user.value.username}:${user.value.auth_key}`
  if (!testData.value) {
    alert('Сначала сохраните тест.')
    return
  }

  try {
    if (props.item) {
      await axios.post(`${apiUrl.value}api-test/update${authGet}`, {
        id: props.item.id,
        theme_id: formData.theme,
        category_id: formData.categorieId,
        name: testData.value.name,
        description: testData.value.description,
        photo: srcPhoto.value,
      })

      const questionResponse = await axios.get(`${apiUrl.value}api-test-q/get-list${authGet}&test_id=${props.item.id}`)
      const questionIds = questionResponse.data.qs

      for (const q of questionIds) {
        const answersResponse = await axios.get(`${apiUrl.value}api-test-a/get-list${authGet}&question_id=${q.id}`)
        for (const answer of answersResponse.data.answer) {
          await axios.post(`${apiUrl.value}api-test-a/del${authGet}`, { id: answer.id })
        }
        await axios.post(`${apiUrl.value}api-test-q/del${authGet}`, { id: q.id })
      }

      for (let i = 0; i < testData.value.questions.length; i++) {
        const question = testData.value.questions[i]
        const questionResponse = await axios.post(
          `${apiUrl.value}api-test-q/set${authGet}`,
          {
            test_id: props.item.id,
            question: question.question,
            sort: i,
          },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        const questionId = questionResponse.data.testQ.id
        for (let j = 0; j < question.answers.length; j++) {
          const answer = question.answers[j]
          await axios.post(`${apiUrl.value}api-test-a/set${authGet}`, {
            question_id: questionId,
            text: answer.text,
            points: answer.points,
            sort: j,
          })
        }
      }
    } else {
      const testResponse = await axios.post(`${apiUrl.value}api-test/set${authGet}`, {
        theme_id: formData.theme,
        category_id: formData.categorieId,
        name: testData.value.name,
        description: testData.value.description,
        photo: srcPhoto.value,
      })

      const testId = testResponse.data.test.id
      for (let i = 0; i < testData.value.questions.length; i++) {
        const question = testData.value.questions[i]
        const questionResponse = await axios.post(
          `${apiUrl.value}api-test-q/set${authGet}`,
          {
            test_id: testId,
            question: question.question,
            sort: i,
          },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        const questionId = questionResponse.data.testQ.id
        for (let j = 0; j < question.answers.length; j++) {
          const answer = question.answers[j]
          await axios.post(`${apiUrl.value}api-test-a/set${authGet}`, {
            question_id: questionId,
            text: answer.text,
            points: answer.points,
            sort: j,
          })
        }
      }

      toast.success('Тест успешно сохранен!', { autoClose: 1000 })
    }
  } catch (error) {
    console.error('Ошибка при отправке теста:', error)
    toast.error('Ошибка при сохранении теста.')
  }
}

// Получение вопросов
const getQuestions = async (testId) => {
  const authGet = `&auth=${user.value.username}:${user.value.auth_key}`
  try {
    const response = await axios.get(`${apiUrl.value}api-test-q/get-list&test_id=${testId}${authGet}`)
    return response.data.qs
  } catch (error) {
    console.error('Ошибка получения вопросов:', error)
  }
}

// Наблюдение за modelValue
watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && editor.value.getHTML() !== value) {
      editor.value.commands.setContent(value)
    }
  }
)

// Инициализация при монтировании
onMounted(async () => {
  if (props.propsPage.includes('-category')) {
    flagCategry.value = true
  }
  formData.type = props.propsPage

  await getCategories()
  await getThemes()
  if (props.propsPage === 'video') {
    await getBloggers()
  }

  if (props.propsPage === 'test') {
    srcPhoto.value = props.item?.photo
    testData.value = {
      name: props.item?.name,
      description: props.item?.description,
      questions: [],
    }
    try {
      const questions = await getQuestions(props.item?.id)
      testData.value.questions = questions
    } catch (error) {
      console.error('Ошибка при загрузке вопросов:', error)
    }
  } else {
    itemData.value = props.item || {}
    formData.shortText = itemData.value?.description || itemData.value?.short_text || itemData.value?.text
    formData.text = itemData.value?.content || itemData.value?.text
    formData.title = itemData.value?.title || itemData.value?.name
    formData.categorieId = itemData.value?.category_id
    formData.link = itemData.value?.link
    formData.audio = itemData.value?.link
    srcPhoto.value =
      itemData.value?.title_photo ||
      itemData.value?.poster ||
      itemData.value?.podcast_banner ||
      itemData.value?.pic ||
      null
    dopBannerSrc.value = itemData.value?.banner || null
    dopBannerSrc2.value = itemData.value?.banner_full || null
    dopQuote.value = itemData.value?.quote || null
    sort.value = itemData.value?.sort
    timestampPublish.value = itemData.value?.date_publication * 1000 || null
    bloggerId.value = itemData.value?.blogger_id
  }

  if (timestampPublish.value) {
    handleDateChange(timestampPublish.value)
  }

  // editor.value = new Editor({
  //   content: formData.text,
  //   extensions: [
  //     Document,
  //     Paragraph,
  //     Text,
  //     Image,
  //     Dropcursor,
  //     StarterKit.configure({
  //       heading: {
  //         levels: [1, 2, 3],
  //       },
  //     }),
  //     Image,
  //   ],
  //   onUpdate: ({ editor }) => {
  //     formData.text = editor.getHTML()
  //     emit('update:modelValue', formData.text)
  //   },
  // })
})

// Очистка перед размонтированием
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<template>
  <div class="content-editor">
    <!-- <div class="wrap-calendar">
      <div class="price__item-btnCalendar" @click="toggleCalendar" ref="button">
        {{ formattedDate }}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14.9386 6.7124L10.0486 11.6024C9.47109 12.1799 8.52609 12.1799 7.94859 11.6024L3.05859 6.7124"
            stroke="#1A1A1A"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div v-if="isCalendarVisible" class="calendar-container" ref="calendar">
        <VDatePicker
          v-model="dateRange"
          :attributes="attributes"
          :disabled-dates="disabledDates"
          mode="dateTime"
          is24hr
          :columns="1"
          :is-range="false"
          @click:outside="isCalendarVisible = false"
          @update:model-value="handleDateChange()"
        />
        <VCalendar />
      </div>
    </div> -->
    <div v-if="propsPage != 'test'" class="form-group">
      <label for="title">Наименование</label>
      <input
        type="text"
        v-model="formData.title"
        value="{{itemData?.title || itemData?.name}}"
        placeholder="Название"
      />
    </div>
    <div v-if="propsPage == 'test'" class="form-group">
      <test-element v-if="!testData" :initialTestData="testData" @save="handleSaveTest" />
      <test-element v-if="testData?.questions" :initialTestData="testData" @save="handleSaveTest" />
    </div>
    <div
      v-if="propsPage === 'podcast-category' || propsPage === 'video-category' || propsPage === 'news-category'"
      class="form-group"
    >
      <label for="text">Краткое описание</label>
      <textarea
        v-model="formData.shortText"
        placeholder="Введите текст"
        value="{{itemData?.description || itemData?.short_text}}"
        rows="5"
      ></textarea>
    </div>
    <!-- Поле для загрузки изображения -->

    <div v-if="propsPage === 'theme'" class="form-group">
      <label for="image">Баннер страницы темы Шапка</label>
      <input
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
        type="file"
        id="headerBanner"
        @change="uploadPhoto(event, false, true)"
      />
      <div v-if="!headerBannerSrc">
        <img
          v-if="itemData?.img"
          :src="apiDomain + 'web/uploads/' + itemData?.img"
          alt="Preview"
          class="image-preview"
        />
      </div>
      <div v-if="headerBannerSrc">
        <img :src="apiDomain + 'web/uploads/' + headerBannerSrc" alt="Preview" class="image-preview" />
      </div>
    </div>

    <div v-if="!this.flagCategry && propsPage != 'notify'" class="form-group">
      <label v-if="propsPage != 'theme'" for="image">Изображение</label>
      <label v-if="propsPage === 'theme'" for="image">Баннер подкастов</label>
      <input accept=".jpg,.jpeg,.png,.gif,.webp,.svg" type="file" @change="uploadPhoto" />
      <div v-if="!srcPhoto">
        <img
          v-if="itemData?.title_photo || itemData?.poster || itemData?.podcast_banner"
          :src="apiDomain + 'web/uploads/' + itemData?.title_photo || itemData?.poster || itemData?.podcast_banner"
          alt="Preview"
          class="image-preview"
        />
      </div>
      <div v-if="srcPhoto">
        <img :src="apiDomain + 'web/uploads/' + srcPhoto" alt="Preview" class="image-preview" />
      </div>
    </div>
    <div v-if="propsPage === 'book' || propsPage === 'material'" class="form-group">
      <label for="image">Файл книги / материала</label>
      <input accept=".pdf,.epub,.fb2" type="file" id="fileBook" @change="uploadBook" />
    </div>
    <div v-if="propsPage === 'theme'" class="form-group">
      <label for="image">Баннер страницы темы</label>
      <input accept=".jpg,.jpeg,.png,.gif,.webp,.svg" type="file" id="dopBanner" @change="uploadPhoto(event, true)" />
      <div v-if="!dopBannerSrc">
        <img
          v-if="itemData?.title_photo || itemData?.poster || itemData?.podcast_banner || itemData?.banner"
          :src="
            apiDomain + 'web/uploads/' + itemData?.title_photo ||
            itemData?.poster ||
            itemData?.podcast_banner ||
            itemData?.banner
          "
          alt="Preview"
          class="image-preview"
        />
      </div>
      <div v-if="dopBannerSrc">
        <img :src="apiDomain + 'web/uploads/' + dopBannerSrc" alt="Preview" class="image-preview" />
      </div>
    </div>
    <div v-if="propsPage === 'theme'" class="form-group">
      <label for="image">Баннер для фразы</label>
      <input
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
        type="file"
        id="dopBanner2"
        @change="uploadPhoto(event, false, false, true)"
      />
      <div v-if="!dopBannerSrc2">
        <img
          v-if="itemData?.banner_full"
          :src="apiDomain + 'web/uploads/' + itemData?.banner_full"
          alt="Preview"
          class="image-preview"
        />
      </div>
      <div v-if="dopBannerSrc2">
        <img :src="apiDomain + 'web/uploads/' + dopBannerSrc2" alt="Preview" class="image-preview" />
      </div>
    </div>
    <div v-if="propsPage === 'theme'" class="form-group">
      <label for="title">Фраза анимации</label>
      <textarea v-model="dopQuote" placeholder="Введите текст" rows="5"></textarea>
    </div>
    <div v-if="propsPage != 'test'" class="form-group">
      <label for="text">Краткое описание</label>
      <textarea v-model="formData.shortText" placeholder="Введите текст" rows="5"></textarea>
      <!-- <quill-editor
        v-model="state.content"
        
      /> -->
    </div>
    <!-- Текстовое поле или редактор текста -->
    <div v-if="formData.type === 'news'" class="form-group">
      <label for="text">Основной контент</label>

      <div v-if="editor" class="tiltapContainer">
        <div class="control-group">
          <div class="button-group">
            <label for="fileNews">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-card-image"
                viewBox="0 0 16 16"
              >
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                <path
                  d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z"
                />
              </svg>
            </label>
            <input id="fileNews" type="file" @change="handleImageUpload" />
            <!-- Инпут для выбора изображения -->
            <!-- <button @click="addImage">Insert image from URL</button> -->
            <button
              @click="editor.chain().focus().toggleOrderedList().run()"
              :class="{ 'is-active': editor.isActive('orderedList') }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-list-ol"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"
                />
                <path
                  d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z"
                />
              </svg>
            </button>

            <button
              @click="editor.chain().focus().splitListItem('listItem').run()"
              :disabled="!editor.can().splitListItem('listItem')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-list-ol"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"
                />
                <path
                  d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z"
                />
              </svg>
            </button>
            <button
              @click="editor.chain().focus().sinkListItem('listItem').run()"
              :disabled="!editor.can().sinkListItem('listItem')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-list"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                />
              </svg>
            </button>
            <!-- <button
              @click="editor.chain().focus().liftListItem('listItem').run()"
              :disabled="!editor.can().liftListItem('listItem')"
            >
              Lift list item
            </button> -->
            <button
              @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
              :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-type-h1"
                viewBox="0 0 16 16"
              >
                <path
                  d="M7.648 13V3H6.3v4.234H1.348V3H0v10h1.348V8.421H6.3V13zM14 13V3h-1.333l-2.381 1.766V6.12L12.6 4.443h.066V13z"
                />
              </svg>
            </button>
            <button
              @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
              :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-type-h2"
                viewBox="0 0 16 16"
              >
                <path
                  d="M7.495 13V3.201H6.174v4.15H1.32V3.2H0V13h1.32V8.513h4.854V13zm3.174-7.071v-.05c0-.934.66-1.752 1.801-1.752 1.005 0 1.76.639 1.76 1.651 0 .898-.582 1.58-1.12 2.19l-3.69 4.2V13h6.331v-1.149h-4.458v-.079L13.9 8.786c.919-1.048 1.666-1.874 1.666-3.101C15.565 4.149 14.35 3 12.499 3 10.46 3 9.384 4.393 9.384 5.879v.05z"
                />
              </svg>
            </button>
            <button
              @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
              :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-type-h3"
                viewBox="0 0 16 16"
              >
                <path
                  d="M11.07 8.4h1.049c1.174 0 1.99.69 2.004 1.724s-.802 1.786-2.068 1.779c-1.11-.007-1.905-.605-1.99-1.357h-1.21C8.926 11.91 10.116 13 12.028 13c1.99 0 3.439-1.188 3.404-2.87-.028-1.553-1.287-2.221-2.096-2.313v-.07c.724-.127 1.814-.935 1.772-2.293-.035-1.392-1.21-2.468-3.038-2.454-1.927.007-2.94 1.196-2.981 2.426h1.23c.064-.71.732-1.336 1.744-1.336 1.027 0 1.744.64 1.744 1.568.007.95-.738 1.639-1.744 1.639h-.991V8.4ZM7.495 13V3.201H6.174v4.15H1.32V3.2H0V13h1.32V8.513h4.854V13z"
                />
              </svg>
            </button>
            <button
              @click="editor.chain().focus().toggleBold().run()"
              :class="{ 'is-active': editor.isActive('bold') }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-type-bold"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"
                />
              </svg>
            </button>
          </div>
        </div>
        <editor-content :editor="editor" />
      </div>
    </div>

    <!-- Селектор темы -->
    <div
      v-if="propsPage != 'theme' && !this.flagCategry && propsPage != 'notify' && propsPage != 'blogger'"
      class="form-group"
    >
      <label for="theme">Выберите тему</label>
      <select v-model="formData.theme">
        <option value="">Выберите тему</option>
        <option v-for="theme in themesReset" :key="theme" :value="theme.id">
          {{ theme.name }}
        </option>
      </select>
    </div>
    <div
      v-if="!this.flagCategry && propsPage != 'theme' && propsPage != 'notify' && propsPage != 'blogger'"
      class="form-group"
    >
      <label for="theme">Выберите категорию</label>
      <select v-model="formData.categorieId">
        <option value="">Выберите тему</option>
        <option v-for="cat in categoriesReset" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>
    <div v-if="propsPage == 'video' && propsPage != 'notify' && propsPage != 'blogger'" class="form-group">
      <label for="theme">Выберите блогера</label>
      <select v-model="blogger_id">
        <option :selected="'clear' == blogger_id || blogger_id == null" :value="'clear'">Выберите блогера</option>
        <option v-for="cat in bloggerReset" :key="cat.id" :selected="cat.id == blogger_id" :value="cat.id">
          {{ cat.title }}
        </option>
      </select>
    </div>

    <!-- Дополнительные поля в зависимости от типа -->
    <div v-if="formData.type === 'podcast'" class="form-group">
      <label for="audio">Аудиофайл</label>
      <input accept=".mp3,.ogg,.wav" type="file" @change="onAudioChange" />
    </div>
    <div v-if="propsPage == 'notify'" class="form-group">
      <label for="video">Ссылка на ресурс (полная)</label>
      <input v-model="formData.link" placeholder="Вставьте ссылку" />
    </div>
    <div v-if="formData.type === 'video'" class="form-group">
      <label for="video">Ссылка на видео (iframe)</label>
      <input v-model="formData.link" placeholder="Вставьте ссылку на iframe видео" />
    </div>
    <div v-if="formData.type === 'video' || formData.type === 'podcast'" class="form-group">
      <label for="video">Сортировка</label>
      <input v-model="sort" placeholder="Укажите сортировку для видео" type="number" min="1" max="1000" step="1" />
    </div>

    <!-- Кнопка для сохранения -->
    <button v-if="propsPage != 'test'" @click="saveContent" class="btn-white">Сохранить</button>
    <button v-if="propsPage == 'test'" @click="sendToServer" class="btn-white">Сохранить</button>
  </div>
</template>
<style scoped>
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
  border: 1px solid #5f22c1;
  padding: 5px;
  min-height: 34px;
}
/* Basic editor styles */
.tiptap:first-child {
  margin-top: 0;
}

.tiptap img {
  display: block;
  height: auto;
  margin: 1.5rem 0;
  max-width: 100%;
}

.ProseMirror-selectednode {
  outline: 3px solid var(--purple);
}
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
.tiltapContainer {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}
.wrap-calendar {
  position: relative;
  width: max-content;
}

.price__item-btnCalendar {
  cursor: pointer;
  padding: 8px 15px;
  border: 1px solid #1a1a1a;
  border-radius: 7px;
  font-family: Aeroport;
  font-size: 16px;
  font-weight: 400;
  max-width: 233px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.calendar-container {
  position: absolute;
  top: 43px;
  transform: translateX(50%);
  right: 0;
  z-index: 4;
}
</style>

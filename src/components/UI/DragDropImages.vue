<script setup>
import { ref, watch } from 'vue'
import vuedraggable from 'vuedraggable'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  multiple: Boolean, // исправил тип на Boolean
})

const fileInput = ref(null)
const isDragActive = ref(false)
const images = ref([])
const skipNextUpdate = ref(false)

const emit = defineEmits(['update:modelValue', 'removeImage'])

// Синхронизация с внешним modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (skipNextUpdate.value) {
      skipNextUpdate.value = false
      return
    }
    images.value = [...newValue]
  },
  { immediate: true, deep: true }
)

// Обновляем родительский компонент при изменениях
watch(
  images,
  (newImages) => {
    skipNextUpdate.value = true
    emit('update:modelValue', [...newImages])
  },
  { deep: true }
)

// Открыть диалог выбора файлов
const triggerFileInput = () => {
  fileInput.value.click()
}

// Обработчик выбора файлов
const handleFileUpload = (event) => {
  processFiles([...event.target.files])
}

// Обработчик перетаскивания файлов
const handleDrop = (e) => {
  e.preventDefault()
  isDragActive.value = false
  processFiles([...e.dataTransfer.files])
}

// Преобразование файлов в объекты с превью
const processFiles = (files) => {
  files.forEach((file) => {
    if (!file.type.match('image.*')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      images.value.push({
        id: Date.now() + Math.random(),
        url: e.target.result,
        file: file,
        isExisting: false, // добавляем флаг для новых файлов
      })
    }
    reader.readAsDataURL(file)
  })
}

// Удаление изображения
const removeImage = (image) => {
  // Отправляем событие в родительский компонент
  emit('removeImage', image)

  // Удаляем изображение из локального состояния
  images.value = images.value.filter((img) => img.id !== image.id)
}

// Стили для области перетаскивания
const dragOver = (e) => {
  e.preventDefault()
}

const dragEnter = () => {
  isDragActive.value = true
}

const dragLeave = () => {
  isDragActive.value = false
}
</script>

<template>
  <div>
    <!-- Кнопка для выбора файлов -->
    <button @click="triggerFileInput" class="btn-white">Добавить изображение</button>
    <!-- Скрытый input -->
    <input
      type="file"
      ref="fileInput"
      :multiple="multiple"
      accept="image/*"
      @change="handleFileUpload"
      style="display: none"
    />

    <!-- Область для перетаскивания -->
    <div
      class="drop-zone"
      @dragover.prevent="dragOver"
      @drop="handleDrop"
      @dragenter="dragEnter"
      @dragleave="dragLeave"
      :class="{ 'drag-active': isDragActive }"
    >
      <!-- Вывод изображений с vuedraggable -->
      <vuedraggable v-model="images" item-key="id" @start="drag = true" @end="drag = false">
        <template #item="{ element }">
          <div class="image-item">
            <img :src="element.url" :alt="element.name" />
            <button @click="removeImage(element)" class="remove-btn">x</button>
          </div>
        </template>
      </vuedraggable>
      <p v-if="!images.length">Перетащите изображение сюда</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.btn-white {
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px; /* 112.5% */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f1f1f1;
  border-radius: 8px;
  width: max-content;
  padding: 8px 20px;
  border: 1px solid #000;
  transition: all 0.5s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: #464649;
    color: #fff;
  }
}
.drop-zone {
  border: 2px dashed #ccc;
  padding: 10px;
  margin-top: 20px;
  min-height: 200px;
  font-size: 14px;
}

.drag-active {
  border-color: #42b883;
  background-color: rgba(66, 184, 131, 0.1);
}

.image-item {
  position: relative;
  display: inline-block;
  margin: 5px;
}

.image-item img {
  width: 175px;
  height: 175px;
  object-fit: cover;
  cursor: pointer;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgb(233 17 17);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style>

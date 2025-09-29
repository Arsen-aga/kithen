<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])
const fileInput = ref(null)
const video = ref(props.modelValue)
const isVideoUploading = ref(false)

watch(
  video,
  (newVideo) => {
    emit('update:modelValue', newVideo)
  },
  { deep: true }
)

// Открыть диалог выбора файла
const triggerFileInput = () => {
  fileInput.value.click()
}

// Обработчик выбора файла
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Проверка что это видео файл
  if (!file.type.match('video.*')) {
    alert('Пожалуйста, выберите видео файл')
    return
  }

  processVideoFile(file)
}

// Обработка видео файла
const processVideoFile = (file) => {
  isVideoUploading.value = true

  const reader = new FileReader()

  reader.onload = (e) => {
    // Создаем объект видео
    video.value = {
      id: Date.now() + Math.random(),
      url: e.target.result,
      file: file,
      name: file.name,
      type: file.type,
      size: file.size,
    }

    isVideoUploading.value = false
  }

  reader.onerror = () => {
    alert('Ошибка при чтении файла')
    isVideoUploading.value = false
  }

  reader.readAsDataURL(file)
}

// Альтернативный вариант - воспроизведение в модальном окне на той же странице
const showVideoModal = ref(false)

const playVideoInline = () => {
  showVideoModal.value = true
}

const closeVideoModal = () => {
  showVideoModal.value = false
}

// Удаление видео
const removeVideo = () => {
  video.value = null
  // Очищаем input чтобы можно было выбрать тот же файл снова
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="video-uploader">
    <!-- Кнопка для выбора файла -->
    <button @click="triggerFileInput" class="btn-white" :disabled="isVideoUploading">
      <span v-if="isVideoUploading">Загрузка...</span>
      <span v-else>{{ video ? 'Заменить видео' : 'Добавить видео' }}</span>
    </button>

    <!-- Скрытый input -->
    <input type="file" ref="fileInput" accept="video/*" @change="handleFileUpload" style="display: none" />

    <!-- Прелоадер -->
    <div v-if="isVideoUploading" class="uploading-state">
      <div class="spinner"></div>
      <p>Загрузка видео...</p>
    </div>

    <!-- Превью видео -->
    <div v-if="video && !isVideoUploading">
      <div class="video-thumbnail">
        <!-- Плейсхолдер для видео с кнопкой воспроизведения -->
        <div class="video-placeholder" @click="playVideoInline">
          <div class="play-button">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div class="video-info">
            <p class="video-name">{{ video.name }}</p>
            <p class="video-size">{{ (video.size / (1024 * 1024)).toFixed(2) }} MB</p>
          </div>
        </div>
      </div>

      <!-- Альтернативная кнопка воспроизведения -->
      <button @click="removeVideo" class="play-external-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        Удалить видео
      </button>
    </div>

    <!-- Модальное окно для просмотра видео -->
    <div v-if="showVideoModal" class="video-modal" @click="closeVideoModal">
      <div class="modal-content" @click.stop>
        <button @click="closeVideoModal" class="close-modal-btn">×</button>
        <video v-if="video" controls autoplay>
          <source :src="video.url" :type="video.type" />
          Ваш браузер не поддерживает видео тег.
        </video>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.video-uploader {
  width: 100%;
}

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
  margin-bottom: 20px;

  &:hover:not(:disabled) {
    background-color: #464649;
    color: #fff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.uploading-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 20px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #464649;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.video-preview {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
}

.video-thumbnail {
  position: relative;
  margin-bottom: 15px;
}

.video-placeholder {
  position: relative;
  width: 300px;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

    .play-button {
      transform: scale(1.1);
    }
  }
}

.play-button {
  transition: transform 0.3s ease;
  margin-bottom: 15px;
}

.video-info {
  text-align: center;
  color: white;

  .video-name {
    font-weight: 600;
    margin-bottom: 5px;
    font-size: 14px;
  }

  .video-size {
    font-size: 12px;
    opacity: 0.8;
  }
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #e91111;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: #c00;
    transform: scale(1.1);
  }
}

.play-external-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 300px;
  background: #e91111;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: #c00;
  }
}

.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;

  video {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
  }
}

.close-modal-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: #e91111;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;

  &:hover {
    background: #c00;
  }
}
</style>

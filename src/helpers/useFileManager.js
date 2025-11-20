import { ref } from 'vue'
import { useApi } from './useApi'
import { deleteFile, useFileUpload } from '@/helpers/useFileUpload'

export function useFileManager() {
  const { uploadFile, uploadMultipleFiles } = useFileUpload()
  const { post, get, delete: deleteApi } = useApi()

  const imagesSrc = ref([])
  const videoSrc = ref(null)
  const filesToDelete = ref([])

  const initFiles = (files, type) => {
    if (!files || !Array.isArray(files)) return type === 'images' ? [] : null

    if (type === 'images') {
      return files.map((img) => ({
        id: img.id || Date.now() + Math.random(),
        url: `https://back.love-kitchen.ru/web/uploads/${img.filename}`,
        nameUrl: img.filename,
        name: img.filename,
        isExisting: true,
      }))
    } else {
      const videoFile = files[0]
      return videoFile
        ? {
            id: videoFile.id || Date.now() + Math.random(),
            url: `https://back.love-kitchen.ru/web/uploads/${videoFile.filename}`,
            nameUrl: videoFile.filename,
            name: videoFile.filename,
            isExisting: true,
          }
        : null
    }
  }

  const productToFile = async (productId, fileNames, type) => {
    if (!productId) throw new Error('ID товара не найден')

    const createConnection = async (filename) => {
      const formData = new FormData()
      formData.append('product_id', productId)
      formData.append('type', type)
      formData.append('filename', filename)

      return await post('product-to-files', formData, 'multipart/form-data')
    }

    if (Array.isArray(fileNames) && fileNames.length > 0) {
      return Promise.all(fileNames.map((filename) => createConnection(filename)))
    } else if (fileNames) {
      return createConnection(fileNames)
    }
  }

  const handleFileRemove = (file, productId = null, filesArray = null) => {
    console.log('Файл помечен на удаление', file)

    // Добавляем файл в список для удаления (только существующие файлы)
    if (file.isExisting && file.nameUrl) {
      filesToDelete.value.push({
        ...file,
        productId, // Сохраняем productId для удаления связи
        filesArray, // Сохраняем ссылку на массив для обновления UI
      })
    }

    // Удаляем файл из UI сразу
    if (filesArray) {
      const index = filesArray.findIndex((item) => item.id === file.id)
      if (index !== -1) {
        filesArray.splice(index, 1)
      }
    }
  }

  const deleteMarkedFiles = async () => {
    if (filesToDelete.value.length === 0) return

    console.log('Удаляем помеченные файлы:', filesToDelete.value)

    try {
      for (const file of filesToDelete.value) {
        // Удаляем физический файл с сервера
        await deleteFile(file)

        // Удаляем связь с продуктом (если есть productId)
        if (file.productId) {
          await removeFileFromProduct(file.productId, file)
        }
      }

      // Очищаем список после успешного удаления
      filesToDelete.value = []
      console.log('Все помеченные файлы успешно удалены')
    } catch (error) {
      console.error('Ошибка удаления файлов:', error)
      throw error // Пробрасываем ошибку дальше
    }
  }

  const deleteCategoryImage = async (imageUrl) => {
    if (!imageUrl) return

    try {
      const fileName = imageUrl.split('/').pop()
      await deleteFile({ nameUrl: fileName })
      console.log('Изображение категории удалено с сервера:', fileName)
    } catch (error) {
      console.error('Ошибка удаления изображения категории:', error)
      throw error
    }
  }

  const removeFileFromProduct = async (productId, file) => {
    console.log('удалили файл', productId, file)
    try {
      const connection = await get('product-to-files')
      console.log(connection)
      const foundConnection = connection?.find(
        (item) => item.product_id === productId && item.filename === file.nameUrl
      )
      if (foundConnection) {
        await deleteApi(`product-to-files/${foundConnection.id}`)
      }
    } catch (error) {
      console.error('Ошибка удаления связи атрибута:', error)
    }
  }

  const clearFilesToDelete = () => {
    filesToDelete.value = []
  }

  return {
    imagesSrc,
    videoSrc,
    initFiles,
    productToFile,
    handleFileRemove,
    uploadFile,
    uploadMultipleFiles,
    removeFileFromProduct,
    clearFilesToDelete, // Новый метод
    deleteMarkedFiles, // Новый метод
    deleteCategoryImage,
  }
}

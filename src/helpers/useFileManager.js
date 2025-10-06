import { ref } from 'vue'
import { useApi } from './useApi'
import { deleteFile, useFileUpload } from '@/helpers/useFileUpload'

export function useFileManager() {
  const { uploadFile, uploadMultipleFiles } = useFileUpload()
  const { post, get, delete: deleteApi } = useApi()

  const imagesSrc = ref([])
  const videoSrc = ref(null)

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

  const handleFileRemove = async (file, filesArray = null) => {
    console.log('удаленный файл', file)
    try {
      if (file.isExisting && file.nameUrl) {
        await deleteFile(file)
      }
      if (filesArray) {
        filesArray = filesArray.filter((item) => item.id !== file.id)
      } else {
        return null
      }
    } catch (error) {
      console.error('Ошибка при удалении файла:', error)
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

  return {
    imagesSrc,
    videoSrc,
    initFiles,
    productToFile,
    handleFileRemove,
    uploadFile,
    uploadMultipleFiles,
    removeFileFromProduct,
  }
}

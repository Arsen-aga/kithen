import axios from 'axios'
import { useDefaultItems } from '@/stores/default'
const store = useDefaultItems()
const headersPost = {
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: 'Bearer ' + store.getBearer,
  },
}

export const useFileUpload = () => {
  const uploadFile = async (productId, fileItem, fileType = 'файла') => {
    if (!fileItem || fileItem.isExisting) return null

    const newFormData = new FormData()
    newFormData.append('UploadForm[file]', fileItem.file)
    newFormData.append('folder', `products/${productId || 'temp'}`)
    newFormData.append('filenamePrefix', 'product_')

    try {
      const response = await axios.post(`${store.getApiDomain}/uploads/file`, newFormData, headersPost)
      return response.data
    } catch (error) {
      console.error(`Ошибка загрузки ${fileType}:`, error)
      throw new Error(`Ошибка при загрузке ${fileType}: ${error.message}`)
    }
  }

  const uploadMultipleFiles = async (productId, files, fileType = 'файлов') => {
    const uploadPromises = files.filter((file) => !file.isExisting).map((file) => uploadFile(productId, file, fileType))

    return await Promise.all(uploadPromises)
  }

  return {
    uploadFile,
    uploadMultipleFiles,
  }
}

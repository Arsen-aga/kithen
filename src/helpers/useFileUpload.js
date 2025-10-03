import axios from 'axios'
import { useDefaultItems } from '@/stores/default'

export const useFileUpload = () => {
  const store = useDefaultItems()
  const headersPost = {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: 'Bearer ' + store.getBearer,
    },
  }
  const uploadFile = async (productId, fileItem, pathName = 'product') => {
    if (!fileItem || fileItem.isExisting) return null

    const newFormData = new FormData()
    newFormData.append('UploadForm[file]', fileItem.file)
    newFormData.append('folder', `${pathName}s/${productId || 'temp'}`)
    newFormData.append('filenamePrefix', `${pathName}_`)

    try {
      const response = await axios.post(`${store.getApiDomain}/uploads/file`, newFormData, headersPost)
      return response.data
    } catch (error) {
      console.error(`Ошибка загрузки файла ${pathName}:`, error)
      throw new Error(`Ошибка при загрузке файла ${pathName}: ${error.message}`)
    }
  }

  const uploadMultipleFiles = async (productId, files, pathName = 'product') => {
    const uploadPromises = files.filter((file) => !file.isExisting).map((file) => uploadFile(productId, file, pathName))

    return await Promise.all(uploadPromises)
  }

  return {
    uploadFile,
    uploadMultipleFiles,
  }
}

export const deleteFile = async (file) => {
  const store = useDefaultItems()
  const headersPost = {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: 'Bearer ' + store.getBearer,
    },
  }
  try {
    if (!file.nameUrl) {
      console.log('Файл не загружен на сервер, удаляем только локально')
      return
    }

    const response = await axios.post(
      `https://back.love-kitchen.ru/web/uploads/delete-file`,
      { file: file.nameUrl },
      headersPost
    )

    console.log('Файл удален с сервера:', response.data)
  } catch (error) {
    console.error('Ошибка удаления файла:', error)
  }
}

import { useApi } from './useApi'

export const useUpload = () => {
  const { makeRequest, apiDomain } = useApi()

  const uploadFile = async (file, folder = 'users/avatar', prefix = 'avatar_') => {
    if (!file) return null

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      throw new Error('Можно загружать только файлы формата JPG, PNG, GIF, WEBP или SVG.')
    }

    const formData = new FormData()
    formData.append('UploadForm[file]', file)
    formData.append('folder', folder)
    formData.append('filenamePrefix', prefix)

    try {
      const response = await makeRequest('upload', formData, 'post')
      return response.data
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  return { uploadFile, apiDomain }
}

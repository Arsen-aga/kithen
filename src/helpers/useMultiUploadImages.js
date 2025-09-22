import axios from 'axios'
import { useDefaultItems } from '@/stores/default'
const store = useDefaultItems()

export const useMultiUploadImages = async (endpoint, token, productId, images) => {
  const domain = `${store.getApiDomain}/${endpoint}`
  const srcImages = []
  console.log(123)

  images.forEach(async (img) => {
    let newFormData = new FormData()
    newFormData.append('UploadForm[file]', img.file)
    newFormData.append('folder', `products/${productId}`)
    newFormData.append('filenamePrefix', 'product_')

    try {
      let resImg = await axios.post(domain, newFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + token,
        },
      })
      const fullPathToImageSorce = `https://back.love-kitchen.ru/web/uploads/${resImg.data}`
      console.log(fullPathToImageSorce)
      srcImages.push(fullPathToImageSorce)
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка при загрузке фото. Попробуйте еще раз.')
    }
  })

  return srcImages
}

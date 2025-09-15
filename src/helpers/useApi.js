import axios from 'axios'
import { useDefaultItems } from '@/stores/default'
import { computed } from 'vue'

export const useApi = () => {
  const store = useDefaultItems()
  const user = computed(() => store.getUser)
  const apiUrl = computed(() => store.getApiUrl)
  const apiDomain = computed(() => store.getApiDomain)

  const makeRequest = async (endpoint, data = null, method = 'get') => {
    try {
      const config = {
        headers: {
          ...(data && { 'Content-Type': 'multipart/form-data' }),
        },
      }

      const url = `${apiUrl.value}${endpoint}`

      if (method === 'get') {
        return await axios.get(url, config)
      } else {
        return await axios.post(url, data, config)
      }
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  return { makeRequest, user, apiUrl, apiDomain }
}

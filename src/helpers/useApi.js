import axios from 'axios'
import { useDefaultItems } from '@/stores/default'
import { useCookies } from 'vue3-cookies'

export function useApi() {
  const { cookies } = useCookies()
  const store = useDefaultItems()
  // const token = store.getBearer

  const token = cookies.get('user-bearer') || store.getBearer

  const baseHeaders = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  }

  const getHeaders = (contentType = 'application/json') => ({
    headers: {
      ...baseHeaders.headers,
      'Content-Type': contentType,
    },
  })

  const apiCall = async (method, url, data = null, contentType = 'application/json', showHeaders) => {
    try {
      const config = {
        method,
        url: `${store.getApiDomain}/${url}`,
        ...getHeaders(contentType),
        ...(data && { data }),
      }

      if (contentType === 'multipart/form-data' && data instanceof FormData) {
        config.data = data
      }

      const response = await axios(config)

      if (showHeaders)
        return {
          data: response.data,
          headers: response.headers,
        }
      return response.data
    } catch (error) {
      console.error(`API Error (${method} ${url}):`, error)
      throw error
    }
  }

  return {
    apiCall,
    get: (url, showHeaders = false) => apiCall('get', url, null, 'application/json', showHeaders),
    post: (url, data, contentType = 'application/json') => apiCall('post', url, data, contentType),
    patch: (url, data) => apiCall('patch', url, data),
    delete: (url) => apiCall('delete', url),
    del: (url) => apiCall('delete', url),
  }
}

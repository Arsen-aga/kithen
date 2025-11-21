import axios from 'axios'
import { useDefaultItems } from '@/stores/default'

export function useApi() {
  const store = useDefaultItems()
  const token = store.getBearer

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

  const apiCall = async (method, url, data = null, contentType = 'application/json') => {
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
      return response.data
    } catch (error) {
      console.error(`API Error (${method} ${url}):`, error)
      throw error
    }
  }

  return {
    apiCall,
    get: (url) => apiCall('get', url),
    post: (url, data, contentType = 'application/json') => apiCall('post', url, data, contentType),
    patch: (url, data) => {
      console.log('data', data)
      console.log('url', url)
      apiCall('patch', url, data)
    },
    delete: (url) => apiCall('delete', url),
    del: (url) => apiCall('delete', url),
  }
}

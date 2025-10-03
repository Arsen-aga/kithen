import { ref, onMounted, watch } from 'vue'
import { useCookies } from 'vue3-cookies'
import { useRouter, useRoute } from 'vue-router'
import { useDefaultItems } from '@/stores/default'
import axios from 'axios'
import { toast } from 'vue3-toastify'

export function useAuth() {
  const store = useDefaultItems()
  const router = useRouter()
  const route = useRoute()
  const { cookies } = useCookies()

  const apiDomain = store.apiDomain
  const userId = ref(null)
  const userBearer = ref(null)

  const getUser = async (id, bearer = userBearer.value) => {
    try {
      const response = await axios.get(`${apiDomain}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${bearer}`,
        },
      })
      store.setUser(response.data)
    } catch (error) {
      console.error(error)
      toast.error('Ошибка загрузки пользователя')
    }
  }

  const loginWithToken = async (token) => {
    try {
      const response = await axios.get(`${apiDomain}/users/ex-login?token=${token}`)
      const data = response.data

      cookies.set('user-id', data.id)
      cookies.set('user-bearer', data.bearer)
      store.setUser(response.data)

      userId.value = data.id
      userBearer.value = data.bearer

      await getUser(data.id, data.bearer)

      router.replace('/') // заменяем URL, убираем ?token=...
      toast.success('Успешная авторизация')
    } catch (error) {
      console.error(error)
      toast.error('Неверный токен авторизации')
      // router.push('/login')
    }
  }

  onMounted(async () => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    console.log('TOKEN:', token)

    if (token) {
      await loginWithToken(token)
    } else {
      userId.value = cookies.get('user-id')
      userBearer.value = cookies.get('user-bearer')

      if (!userId.value || !userBearer.value) {
        router.push('/login')
      } else {
        await getUser(userId.value, userBearer.value)
      }
    }
  })

  // на случай если route поменяется после загрузки
  watch(
    () => route.query.token,
    async (token) => {
      if (token) {
        await loginWithToken(token)
      }
    }
  )

  return {
    userId,
    userBearer,
    getUser,
    loginWithToken,
  }
}

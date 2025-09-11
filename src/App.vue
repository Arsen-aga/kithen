<script setup>
import { ref, onMounted } from 'vue'
import { useCookies } from 'vue3-cookies'
import { useRouter } from 'vue-router'
import { useDefaultItems } from '@/stores/default'
import axios from 'axios'
import 'vue3-toastify/dist/index.css'
const store = useDefaultItems()
const router = useRouter()
const { cookies } = useCookies()

const apiDomain = store.apiDomain
const userId = ref(null)
const userBearer = ref(null)

const getUser = (id) => {
  axios
    .get(apiDomain + '/users/' + id, {
      headers: {
        Authorization: 'Bearer ' + userBearer.value,
      },
    })
    .then((response) => {
      store.setUser(response.data)
      console.log(response.data)
    })
    .catch((error) => {
      console.error(error)
    })
}

onMounted(() => {
  userId.value = cookies.get('user-id')
  userBearer.value = cookies.get('user-bearer')
  if (!userId.value) {
    router.push('/login')
  } else {
    getUser(userId.value)
  }
})
</script>

<template>
  <router-view></router-view>
</template>

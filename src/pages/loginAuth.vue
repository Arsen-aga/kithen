<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useDefaultItems } from '@/stores/default'

const { apiDomain } = useDefaultItems()
const { user } = useDefaultItems()
const token = ref('')

watch(
  () => user.value,
  (val) => {
    token.value = val.bearer
  }
)

const login = ref('')
const password = ref('')

const goLogin = () => {
  axios
    .post(
      apiDomain + '/users/login',
      {
        username: login.value,
        password: password.value,
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + token.value,
        },
      }
    )
    .then((response) => {
      console.log('then', response.data)
    })
    .catch((error) => {
      console.error(error)
    })
}

onMounted(() => {
    console.log('auth', user.value)

})
</script>

<template>
  <div class="form__col">
    <h2 class="form__title">Авторизация</h2>
    <label for="login">
      <span>Логин</span>
      <input v-model="login" type="text" id="login" placeholder="Введите логин" />
    </label>
    <label for="password">
      <span>Пароль</span>
      <input v-model="password" type="password" id="password" placeholder="Введите пароль" />
    </label>
    <div @click="goLogin" class="btn">Войти</div>

    <div class="description__form">
      <p>Еще не зарегистрированы?</p>
      <router-link to="/admin">Регистрация</router-link>
    </div>
  </div>
</template>

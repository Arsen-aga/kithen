<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useDefaultItems } from '@/stores/default'
import MainButton from '@/components/UI/MainButton.vue'
import TreatyItem from '@/components/TreatyItem.vue'

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
    <div class="form__inputs">
      <label for="login">
        <span class="form__label-title">Логин</span>
        <input class="form__inp" v-model="login" type="text" id="login" placeholder="Введите логин" />
      </label>
      <label for="password">
        <span class="form__label-title">Пароль</span>
        <input class="form__inp" v-model="password" type="password" id="password" placeholder="Введите пароль" />
      </label>
      <MainButton @click="goLogin" class="text-red" sizeButton="middle-btn form__btn">Войти</MainButton>
    </div>
    <div class="form__description">
      <p>Еще не зарегистрированы?</p>
      <router-link to="/admin">Регистрация</router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form {
  &__col {
    max-width: 500px;
    margin: 0 auto;
    width: 100%;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0px 2px 8px 0px #00000042;
    padding: 40px;
  }

  &__title {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 26px;
    line-height: calc(32 / 24 * 100%);
    text-wrap-mode: nowrap;
    text-align: center;
    margin-bottom: 20px;
  }

  &__inputs {
    display: grid;
    gap: 15px;
  }

  &__label-title {
    font-family: 'Jost';
    font-weight: 600;
    font-size: 12px;
    line-height: calc(20 / 12 * 100%);
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  &__inp {
    width: 100%;
    height: 76px;
    padding: 26px 25px 24px;
    background-color: var(--light-color);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    font-family: 'Jost';
    font-weight: 400;
    font-size: 18px;
    line-height: calc(26 / 18 * 100%);
    color: var(--default-color);

    &::placeholder {
      color: rgba($color: #464451, $alpha: 0.3);
    }
  }

  &__btn {
    height: 76px;
  }

  &__description {
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
  }
}
</style>

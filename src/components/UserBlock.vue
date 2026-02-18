<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDefaultItems } from '@/stores/default'

import IconMap from '@/components/icons/IconMapPoint.vue'
import LinkButton from '@/components/UI/LinkButton.vue'

const router = useRouter()
const salon = ref('Технологи')

const store = useDefaultItems()
const user = computed(() => store.getUser)

const goToAdmin = () => {
  if (user.value.role.item_name === 'admin') {
    console.log(user.value.username)
    console.log(user.value.role.item_name)
    router.push('/admin')
  }
}
</script>

<template>
  <section class="user-block">
    <div @click="goToAdmin" class="logo-link">
      <img alt="logo" class="logo user-block__logo" src="@/assets/images/logo.svg" />
    </div>
    <div class="user-block__right">
      <IconMap class="user-block__right-icon" />
      <div class="user-block__right-info">
        <p class="user-block__right-text"><span>Ваш салон:</span> {{ salon }}</p>
        <LinkButton class="user-block__btn">Выйти из аккаунта</LinkButton>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.user-block {
  display: flex;
  justify-content: space-between;
  gap: 10px;

  &__logo {
    max-width: 225px;
    width: 100%;
  }

  &__right {
    display: flex;
    gap: 10px;
    margin-top: 17px;
  }

  &__right-text {
    span {
      font-weight: 500;
    }
  }
}

.logo-link {
  cursor: pointer;
}
</style>

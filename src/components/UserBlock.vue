<script setup>
import { ref } from 'vue'
import IconMap from '@/components/icons/IconMapPoint.vue'
import LinkButton from '@/components/UI/LinkButton.vue'

const salon = ref('Технологи')
</script>

<template>
  <section class="user-block">
    <img alt="logo" class="logo user-block__logo" src="@/assets/images/logo.svg" />
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
</style>

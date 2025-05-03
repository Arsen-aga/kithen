<script setup>
import { formatNum } from '@/helpers/formatNum'
defineProps({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
  },
  dots: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <div class="title-dots-price">
    <h3 class="title-dots-price__title">
      {{ title }}
    </h3>
    <div v-if="dots" class="title-dots-price__dots"></div>
    <p v-if="price !== undefined" class="title-dots-price__price">{{ formatNum(price) }} ₽</p>
  </div>
</template>

<style lang="scss" scoped>
.title-dots-price {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;

  &__title {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 24px;
    line-height: calc(32 / 24 * 100%);
    text-wrap-mode: nowrap;
  }

  &__dots {
    height: 1px;
    max-width: 100%;
    width: 100%;
    border-bottom: 1px dashed #e4e4ef;
    margin-bottom: 8px;
  }

  &__price {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 30px;
    line-height: calc(38 / 30 * 100%);
    text-align: right;
    text-wrap-mode: nowrap;
  }
}
</style>

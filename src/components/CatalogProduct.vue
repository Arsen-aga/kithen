<script setup>
import { formatNum } from '@/helpers/formatNum'
import MainButton from '@/components/UI/MainButton.vue'
import CatalogProductSlider from '@/components/CatalogProductSlider.vue'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="catalog-product">
    <CatalogProductSlider
      class="catalog-product__swiper-wrapper"
      :images="product.images"
      :id="product.id"
      :video="product.video"
    />
    <div class="catalog-product__info">
      <h4 class="catalog-product__title">{{ product.title }}</h4>
      <ul class="catalog-product__list">
        <li class="catalog-product__point" v-for="option in product.options" :key="option.id">
          <span>{{ option.option }}</span> {{ option.value }}
        </li>
      </ul>
      <div class="catalog-product__price">
        <span class="catalog-product__price-new">{{ formatNum(product.price, false) }} ₽</span>
        <span class="catalog-product__price-old">{{ formatNum(product.oldPrice, false) }} ₽</span>
      </div>
      <div class="catalog-product__btns">
        <MainButton>Узнать подробнее</MainButton>
        <MainButton class="bg-red">Добавить к заказу</MainButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.catalog-product {
  background-color: var(--light-color);
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  transition: all 0.3s ease-in-out;
  position: relative;
  box-shadow: 0px 0px 2px rgba(163, 169, 183, 1);

  &:hover {
    z-index: 10;
    scale: 1.05;
    box-shadow: 0px 0px 70px rgba(163, 169, 183, 0.2);
  }

  &__info {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-family: 'Jost';
    font-weight: 400;
    font-size: 16px;
    line-height: calc(24 / 16 * 100%);
  }
  &__list {
    margin: 5px 0 15px;
    display: grid;
  }
  &__point {
    font-family: 'Jost';
    font-weight: 400;
    font-size: 14px;
    line-height: calc(22 / 14 * 100%);

    span {
      color: var(--gray-color);
    }
  }

  &__price {
    margin-top: auto;
    display: flex;
    gap: 6px;
  }

  &__price-new {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 22px;
    line-height: calc(30 / 22 * 100%);
    color: var(--accent-color);
  }
  &__price-old {
    margin-top: 5px;
    font-family: 'Jost';
    font-weight: 400;
    font-size: 16px;
    line-height: calc(24 / 16 * 100%);
    text-decoration: line-through;
    color: var(--gray-color);
  }
  &__btns {
    margin-top: 15px;
    display: grid;
    gap: 5px;
  }
}
</style>

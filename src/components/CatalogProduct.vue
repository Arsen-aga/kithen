<script setup>
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import { formatNum } from '@/helpers/formatNum'
import IconArrowSlide from '@/components/icons/IconArrowSlide.vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import MainButton from './UI/MainButton.vue'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})
const currentSlide = ref(0)
const swiperRef = ref(null)
const onSwiper = (swiper) => {
  swiperRef.value = swiper
}

const onSlideChange = () => {
  currentSlide.value = swiperRef.value.activeIndex
}

const goToSlide = (index) => {
  swiperRef.value.slideTo(index)
  currentSlide.value = index
}
const modules = [Navigation, Pagination]
</script>

<template>
  <div class="catalog-product">
    <div class="catalog-product__swiper-wrapper">
      <Swiper
        :slides-per-view="1"
        :space-between="0"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
        :modules="modules"
        class="mySwiper catalog-product__swiper"
      >
        <template v-if="product.images.length">
          <SwiperSlide v-for="(src, index) in product.images" :key="src + index">
            <div class="catalog-product__img-wrapper">
              <img class="catalog-product__img" :src="src" alt="" />
            </div>
          </SwiperSlide>
        </template>
        <template v-else>
          <SwiperSlide>
            <div class="catalog-product__img-wrapper">
              <img class="catalog-product__img" :src="'../src/assets/images/no-img.png'" alt="" />
            </div>
          </SwiperSlide>
        </template>
      </Swiper>
      <div v-if="product.images.length > 1">
        <button
          :class="{ disable: currentSlide === 0 }"
          class="catalog-product__swiper-btn swiper-prev"
          @click="() => swiperRef.slidePrev()"
        >
          <IconArrowSlide />
        </button>
        <button
          :class="{ disable: currentSlide === product.images.length - 1 }"
          class="catalog-product__swiper-btn swiper-next"
          @click="() => swiperRef.slideNext()"
        >
          <IconArrowSlide />
        </button>
      </div>
      <div class="catalog-product__swiper-pagination" v-if="product.images.length > 1">
        <span
          v-for="(image, index) in product.images"
          :key="index"
          @click="goToSlide(index)"
          class="catalog-product__swiper-dot"
          :class="{ active: currentSlide === index }"
        >
        </span>
      </div>
    </div>
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

  &__swiper-wrapper {
    position: relative;
    margin-bottom: 15px;
    padding-bottom: 11px;
  }

  &__swiper {
    max-width: 212px;
    width: 100%;
  }

  &__img-wrapper {
    width: 212px;
    height: 212px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__img {
    max-height: 100%;
    max-width: 100%;
  }

  &__swiper-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    background: var(--accent-color);
    border-radius: 5px;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 1;
    transition: all 0.3s ease-in-out;

    &.disable {
      opacity: 0.5;
      cursor: default;
    }

    &.swiper-prev {
      left: 10px;
    }
    &.swiper-next {
      right: 10px;

      svg {
        rotate: 180deg;
      }
    }
  }

  &__swiper-pagination {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  &__swiper-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--table-color);
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &.active {
      background-color: var(--primary-color);
    }
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

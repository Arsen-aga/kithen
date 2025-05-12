<script setup>
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import FancyboxContainer from '@/components/libs/FancyboxContainer.vue'
import IconArrowSlide from '@/components/icons/IconArrowSlide.vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import PlayButton from '@/components/UI/PlayButton.vue'

defineProps({
  images: {
    type: Array,
    required: true,
  },
  video: {
    type: Array,
  },
  id: {
    type: Number,
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
  <div class="catalog-product-slider__swiper-wrapper">
    <FancyboxContainer :options="{ Carousel: { infinite: true } }">
      <Swiper
        :slides-per-view="1"
        :space-between="0"
        :modules="modules"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
        class="mySwiper catalog-product-slider__swiper"
      >
        <template v-if="images.length || video.length">
          <template v-if="images.length">
            <SwiperSlide v-for="(src, index) in images" :key="src + index">
              <a class="catalog-product-slider__img-wrapper" :href="src" :data-fancybox="`gallery-${id}`">
                <img class="catalog-product-slider__img" :src="src" alt="" />
              </a>
            </SwiperSlide>
          </template>
          <template v-if="video?.length">
            <SwiperSlide v-for="(data, index) in video" :key="data.url + index">
              <a class="catalog-product-slider__img-wrapper" :href="data.url" :data-fancybox="`gallery-${id}`">
                <img class="catalog-product-slider__img" :src="data.preview" alt="" />
                <PlayButton />
              </a>
            </SwiperSlide>
          </template>
        </template>
        <template v-else>
          <SwiperSlide>
            <div class="catalog-product-slider__img-wrapper">
              <img class="catalog-product-slider__img" :src="'../src/assets/images/no-img.png'" alt="" />
            </div>
          </SwiperSlide>
        </template>
      </Swiper>
    </FancyboxContainer>
    <div v-if="images.length > 1">
      <button
        :class="{ disable: currentSlide === 0 }"
        class="catalog-product-slider__swiper-btn swiper-prev"
        @click="() => swiperRef.slidePrev()"
      >
        <IconArrowSlide />
      </button>
      <button
        :class="{ disable: currentSlide === images?.length + video?.length - 1 }"
        class="catalog-product-slider__swiper-btn swiper-next"
        @click="() => swiperRef.slideNext()"
      >
        <IconArrowSlide />
      </button>
    </div>
    <div class="catalog-product-slider__swiper-pagination" v-if="images.length > 1">
      <span
        v-for="(image, index) in [...images, ...video]"
        :key="index"
        @click="goToSlide(index)"
        class="catalog-product-slider__swiper-dot"
        :class="{ active: currentSlide === index }"
      >
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.catalog-product-slider {
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
}
</style>

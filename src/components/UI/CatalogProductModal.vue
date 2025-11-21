<script setup>
import { onMounted, onUnmounted } from 'vue'
import CatalogProductSlider from '@/components/CatalogProductSlider.vue'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['close-modal'])

const closeModal = () => {
  emit('close-modal', false)
  document.body.style.overflow = ''
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close-modal', false)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="modal" @click="closeModal">
    <div class="modal__content">
      <div class="modal__block" @click.stop>
        <div class="modal__close" @click="closeModal">x</div>
        <div class="modal__inner">
          <CatalogProductSlider
            v-if="product.images || product.video"
            class="modal__swiper"
            :images="product.images"
            :id="product.id"
            :video="product.video"
          />
          <div class="modal__info">
            <h2 class="modal__title" v-if="product.title">
              {{ product.title }}
            </h2>
            <ul class="modal__list" v-if="product.options || product.price">
              <li class="modal__point" v-for="option in product.options" :key="option.info">
                <p class="modal__point-title">{{ option.option }}:</p>
                <p class="modal__point-info">{{ option.info }}</p>
              </li>
              <li class="modal__point modal__price" v-if="product.price">
                <p class="modal__point-title">Стоимость:</p>
                <p class="modal__point-info">{{ product.price }} руб.</p>
              </li>
            </ul>
            <p class="modal__description" v-if="product.description">
              {{ product.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 50;
  min-height: 100vh;
  overflow: hidden;
  background-color: rgba($color: #000000, $alpha: 0.7);
  cursor: pointer;

  &__content {
    position: relative;
    padding: 100px 0;
    height: 100%;
    max-height: 100%;
    width: 100%;
    z-index: 1;
    overflow-y: auto;
    display: flex;
    justify-content: center;
  }

  &__block {
    position: relative;
    max-width: 900px;
    width: 100%;
    background-color: #fff;
    border-radius: 16px;
    padding: 40px;
    height: fit-content;
    cursor: initial;
  }

  &__close {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 18px;
    line-height: 1;
    font-weight: 700;
    text-transform: uppercase;
    background-color: #ec1111;
    cursor: pointer;
    opacity: 0.5;
    transition: all 0.3s ease-in-out;

    &:hover {
      scale: 1.1;
      opacity: 1;
    }
  }
  &__swiper {
    height: fit-content;
    float: left;
    margin-right: 30px;
  }

  &__title {
    font-size: 32px;
    line-height: 1.15;
    font-weight: 500;
    margin-bottom: 20px;
  }

  &__list {
    display: grid;
  }
  &__point {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    max-width: 400px;
    gap: 25px;
    font-size: 20px;
    padding: 10px;
    border-radius: 6px;

    &:nth-child(odd) {
      background-color: #f8f8f8;
    }
  }
  &__point-title {
    font-weight: 500;
  }
  &__price {
    color: #fff;
    background-color: #dba250 !important;
    font-weight: 500;
  }

  &__description {
    margin-top: 20px;
  }
}
</style>

<script setup>
import { ref } from 'vue'
import MainButton from '@/components/UI/MainButton.vue'
import { useAccordionItems } from '@/stores/accordionItems'
const { accordionItems } = useAccordionItems()
const items = accordionItems[0].items
const smetaPrice = ref(0)
const formatPrice = (price) => {
  return price.toFixed(2) // Форматируем до двух знаков после запятой
}
</script>

<template>
  <div class="accordion-smeta">
    <MainButton class="accordion-smeta__open-all"> Развернуть все разделы </MainButton>
    <div class="accordion-smeta__items">
      <div class="accordion-smeta__item" v-for="item in items" :key="item.id">
        <div class="accordion-smeta__item-top">
          <h3 class="accordion-smeta__item-title">
            {{ item.title }}
          </h3>
          <div class="accordion-smeta__item-dots"></div>
          <p class="accordion-smeta__item-price">{{ formatPrice(smetaPrice) }} ₽</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.accordion-smeta {
  padding: 15px 0 25px;

  &__open-all {
    margin-left: auto;
    margin-bottom: 20px;
  }

  &__items {
    display: grid;
    gap: 25px;
  }
}
</style>

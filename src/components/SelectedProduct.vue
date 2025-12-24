<script setup>
import SelectedItem from '@/components/SelectedItem.vue'
import TitileDotsPrice from '@/components/UI/TitileDotsPrice.vue'

defineProps({
  item: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="selected-product">
    <TitileDotsPrice class="selected-product__title" :title="item.title" />
    <div class="selected-product__items">
      <SelectedItem v-for="product in item.products" :key="product.id" :item="product" />
    </div>
  </div>
</template>

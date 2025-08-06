<script setup>
import SelectedItem from '@/components/SelectedItem.vue'
import TitileDotsPrice from '@/components/UI/TitileDotsPrice.vue'

defineProps({
  item: {
    type: Object,
    required: true,
  },
  checkedGroup: {
    type: Array,
    required: true,
  },
})
const emit = defineEmits(['update-checked'])
const updateChecked = (index, value) => {
  emit('update-checked', index, value)
}
</script>

<template>
  <div class="selected-product">
    <TitileDotsPrice class="selected-product__title" :title="item.title" />
    <div class="selected-product__items">
      <SelectedItem
        v-for="(product, index) in item.products"
        :key="product.id"
        :item="product"
        :checked="checkedGroup[index]"
        @update-checked="(value) => updateChecked(index, value)"
      />
    </div>
  </div>
</template>

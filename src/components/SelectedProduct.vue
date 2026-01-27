<script setup>
import SelectedItem from '@/components/SelectedItem.vue'
import TitileDotsPrice from '@/components/UI/TitileDotsPrice.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  checkStates: Array,
})

const emit = defineEmits(['update-check-states'])

const changeCheckState = (newCheckState, index) => {
  emit(
    'update-check-states',
    props.checkStates.map((state, i) => (i === index ? newCheckState : state))
  )
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
        :checkState="checkStates[index]"
        @updateCheckState="(checkState) => changeCheckState(checkState, index)"
      />
    </div>
  </div>
</template>

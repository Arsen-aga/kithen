<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  isShow: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:isShow'])
const closeCatalog = () => {
  emit('update:isShow', !props.isShow)
}
</script>

<template>
  <div class="catalog-block" @click="closeCatalog">
    {{ products }}
  </div>
</template>

<style lang="scss" scoped>
.catalog-block {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  background-color: #fff;
}
</style>

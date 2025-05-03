<script setup>
import ScrollTableElem from '@/components/ScrollTableElem.vue'
defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="scroll-table-block">
    <div class="scroll-table-block__items">
      <ScrollTableElem v-for="item in items" :key="item.id" :item="item" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scroll-table-block {
  padding: 25px 0;

  &__items {
    display: grid;
    gap: 25px;
  }
}
</style>

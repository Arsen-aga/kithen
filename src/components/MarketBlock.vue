<script setup>
import MarketItem from '@/components/MarketItem.vue'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="market-items">
    <template v-if="items && items.length > 0">
      <MarketItem v-for="item in items" :key="item.id" :market-item="item" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.market-items {
  padding: 15px 0 25px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
</style>

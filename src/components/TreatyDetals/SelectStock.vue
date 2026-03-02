<script setup>
import SelectItems from '@/components/UI/SelectItems.vue'
import { useSmetaStore } from '@/stores/smeta/index'
import { computed } from 'vue'
const smetaStore = useSmetaStore()
const OrderPromotionItems = computed(() =>smetaStore.smeta?.Order_Promotion ?? null)

const updateItems = (item) => {
  smetaStore.changePromotion(item)
}

</script>

<template>
   <SelectItems class="promotion-method" @updateItems="updateItems" :items="OrderPromotionItems" />
</template>

<style lang="scss" scoped>
.promotion-method {
  width: 100%;
  height: 76px;
  padding: 26px 25px 24px;
  background-color: var(--light-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-family: 'Jost';
  font-weight: 400;
  font-size: 18px;
  line-height: calc(26 / 18 * 100%);
  color: var(--default-color);
}
</style>

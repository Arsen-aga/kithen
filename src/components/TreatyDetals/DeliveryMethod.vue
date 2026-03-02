<script setup>
import SelectItems from '@/components/UI/SelectItems.vue'
import { useSmetaStore } from '@/stores/smeta/index'
import { computed } from 'vue'
const smetaStore = useSmetaStore()
const OrderDeliveryItems = computed(() =>smetaStore.smeta?.Order_delivery ?? null)

const updateItems = (item) => {
  smetaStore.changeDelivery(item)
}

</script>

<template>
   <SelectItems class="delivery-method" @updateItems="updateItems" :items="OrderDeliveryItems" />
</template>

<style lang="scss" scoped>
.delivery-method {
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

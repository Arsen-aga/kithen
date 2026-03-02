<script setup>
// import { useSmetaStore } from '@/stores/smeta/index'
// import { computed } from 'vue'

// const smetaStore = useSmetaStore()
// const orderNumber = computed(() => smetaStore.smetaOrder?.s_number ?? '')
</script>

<template>
  <input class="treaty-item__inp" type="text" :value="0" disabled />
</template>

<style lang="scss" scoped>
.treaty-item {
  &__inp {
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
    color: rgba($color: #464451, $alpha: 0.3);
  }
}
</style>

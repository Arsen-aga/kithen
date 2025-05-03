<script setup>
import ScrollTableList from '@/components/ScrollTableList.vue'
import TitileDotsPrice from '@/components/UI/TitileDotsPrice.vue'

defineProps({
  item: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="scroll-table-elem">
    <TitileDotsPrice class="scroll-table-elem__title" :title="item.title" />
    <ScrollTableList :items="item.services" :price="item.price" />
  </div>
</template>

<style lang="scss" scoped>
.scroll-table-elem {
  &__title {
    margin-bottom: 15px;
  }
}
</style>

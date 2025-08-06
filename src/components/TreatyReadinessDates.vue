<script setup>
import TitileDotsPrice from '@/components/UI/TitileDotsPrice.vue'
import TreatyItem from '@/components/TreatyItem.vue'

defineProps({
  item: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="treaty-dates">
    <TitileDotsPrice class="treaty-dates__title" :title="item.title" :dots="false" />
    <div class="treaty-dates__items">
      <TreatyItem
        v-for="(elem, index) in item.elems"
        :key="elem.id"
        :item="elem"
        :is-calendar="true"
        :is-shipping="!index ? true : false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.treaty-dates {
  border: 1px solid rgba($color: #010000, $alpha: 0.1);
  border-radius: 14px;
  padding: 30px;

  &__title {
    margin-bottom: 25px;
  }

  &__items {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 310px));
    gap: 10px;
  }
}
</style>

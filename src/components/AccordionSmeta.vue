<script setup>
import { ref } from 'vue'
import MainButton from '@/components/UI/MainButton.vue'
import TableOpen from '@/components/TableOpen.vue'
import TitileDotsPrice from '@/components/UI/TitileDotsPrice.vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const smetaPrice = ref(0)
const isOpenAllTable = ref(false)
const openTable = () => {
  isOpenAllTable.value = !isOpenAllTable.value
}
</script>

<template>
  <div class="accordion-smeta">
    <MainButton class="accordion-smeta__open-all" @click="openTable">
      {{ isOpenAllTable ? 'Скрыть' : 'Развернуть' }} все разделы
    </MainButton>
    <div class="accordion-smeta__items">
      <div class="accordion-smeta__item" v-for="item in items" :key="item.id">
        <TitileDotsPrice :title="item.title" :price="smetaPrice" />
        <TableOpen
          v-if="item.table.length"
          :is-open-all-table="isOpenAllTable"
          :tableItems="item.table"
          class="accordion-smeta__item-bottom"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.accordion-smeta {
  padding: 15px 0 25px;

  &__open-all {
    margin-left: auto;
    margin-bottom: 20px;
    max-width: 205px;
    width: 100%;
  }

  &__items {
    display: grid;
    gap: 25px;
  }
}
</style>

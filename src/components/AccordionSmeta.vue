<script setup>
import { ref } from 'vue'
import MainButton from '@/components/UI/MainButton.vue'
import { useAccordionItems } from '@/stores/accordionItems'
import TableOpen from '@/components/TableOpen.vue'
import { formatNum } from '@/components/globalFunctions/func'

const { accordionItems } = useAccordionItems()
const items = accordionItems[0].items
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
        <div class="accordion-smeta__item-top">
          <h3 class="accordion-smeta__item-title">
            {{ item.title }}
          </h3>
          <div class="accordion-smeta__item-dots"></div>
          <p class="accordion-smeta__item-price">{{ formatNum(smetaPrice) }} ₽</p>
        </div>
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

  &__item-top {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 20px;
  }

  &__item-title {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 24px;
    line-height: calc(32 / 24 * 100%);
  }

  &__item-dots {
    height: 1px;
    max-width: 100%;
    width: 100%;
    border-bottom: 1px dashed #e4e4ef;
    margin-bottom: 8px;
  }

  &__item-price {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 30px;
    line-height: calc(38 / 30 * 100%);
    text-align: right;
    text-wrap-mode: nowrap;
  }
}
</style>

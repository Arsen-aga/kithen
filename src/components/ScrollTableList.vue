<script setup>
import { formatNum } from '@/helpers/formatNum'
import ScrollTableItem from '@/components/ScrollTableItem.vue'
import { ref } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const newPrice = ref(props.item.price)
const changePrice = (test) => {
  newPrice.value += test
}
</script>

<template>
  <div class="scroll-table-list">
    <div class="scroll-table-list__table">
      <div class="scroll-table-list__head">
        <div class="scroll-table-list__tr">
          <div class="scroll-table-list__th"></div>
          <div class="scroll-table-list__th">Наименование</div>
          <div class="scroll-table-list__th">Количество</div>
          <div class="scroll-table-list__th">Сумма</div>
        </div>
      </div>
      <div class="scroll-table-list__body">
        <ScrollTableItem :items="item.services" @update-price="changePrice" />
      </div>
    </div>
    <div class="scroll-table-list__price">
      <p class="scroll-table-list__price-text">Общая сумма:</p>
      <p class="scroll-table-list__price-num">{{ formatNum(newPrice, 0) }} ₽</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scroll-table-list {
  &__table {
    border-spacing: 0;
    border-collapse: collapse;
    width: 100%;
    position: relative;
    max-height: 300px;
    overflow: hidden;
    overflow-y: scroll;
    margin-bottom: 15px;
    max-width: 930px;
  }

  &__head {
    background-color: var(--page-bg);
    position: sticky;
    top: 0;
    z-index: 1;
  }

  &__tr {
    display: flex;
  }

  &__th,
  &__td {
    border: 1px solid var(--table-color);
    min-height: 60px;
    height: 100%;
    max-height: 60px;
    padding: 0 15px;
    font-size: 16px;
    line-height: calc(20 / 16 * 100%);
    font-family: 'Jost';
    text-align: center;
    box-sizing: border-box;

    &:nth-child(1) {
      max-width: 60px;
      min-width: 60px;
    }
    &:nth-child(2) {
      min-width: 557px;
      max-width: 557px;
    }
    &:nth-child(3) {
      max-width: 165px;
      min-width: 165px;
    }
    &:nth-child(4) {
      min-width: 145px;
      max-width: 145px;
    }
  }

  &__th {
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 6px 15px;
  }

  &__td {
    &:nth-child(1) {
      text-align: left;
    }
  }

  &__price {
    display: flex;
    justify-content: end;
    gap: 11px;
    margin-right: 11px;
  }

  &__price-text {
    font-size: 24px;
    line-height: calc(32 / 24 * 100%);
    font-family: 'Jost';
    font-weight: 500;
    margin-top: 5px;
  }
  &__price-num {
    font-size: 30px;
    line-height: calc(38 / 30 * 100%);
    font-family: 'Jost';
    font-weight: 500;
  }
}
</style>

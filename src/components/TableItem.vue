<script setup>
import { formatNum } from '@/helpers/formatNum'
import LinkButton from '@/components/UI/LinkButton.vue'

defineProps({
  tableItems: {
    type: Object,
    require: true,
  },
})
</script>

<template>
  <div class="table-item__tr" v-for="item in tableItems" :key="item.key">
    <div class="table-item__td">{{ item.title }}</div>
    <div class="table-item__td">{{ item.unit }}</div>
    <div class="table-item__td">{{ formatNum(item.quantity, 2) }}</div>
    <div class="table-item__td">{{ formatNum(item.price, 2) }} ₽</div>
    <div class="table-item__td">{{ formatNum(item.quantity * item.price, 2) }} ₽</div>
    <div class="table-item__td"><LinkButton class="table-item__link" color="gray">Заменить материал</LinkButton></div>
    <div class="table-item__td">{{ item.percent ? item.percent + '%' : '' }}</div>
  </div>
</template>

<style lang="scss" scoped>
.table-item {
  &__tr {
    display: flex;
  }
  &__td {
    border: 1px solid var(--table-color);
    min-height: 60px;
    height: 60px;
    padding: 0 15px;
    font-size: 16px;
    line-height: calc(20 / 16 * 100%);
    font-family: 'Jost';
    text-align: center;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:nth-child(1) {
      text-align: left;
      justify-content: start;
    }
    &:nth-child(2) {
      max-width: 64px;
    }
    &:nth-child(3) {
      max-width: 78px;
    }
    &:nth-child(4) {
      max-width: 127px;
    }
    &:nth-child(5) {
      max-width: 138px;
    }
    &:nth-child(6) {
      max-width: 168px;
    }
    &:nth-child(7) {
      max-width: 82px;
    }
  }

  &__link {
    transition: all 0.3s ease-in-out;

    &:hover {
      color: var(--primary-color);
    }
  }
}
</style>

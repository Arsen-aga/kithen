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
  <tr v-for="item in tableItems" :key="item.key">
    <td>{{ item.title }}</td>
    <td>{{ item.unit }}</td>
    <td>{{ formatNum(item.quantity) }}</td>
    <td>{{ formatNum(item.price) }} ₽</td>
    <td>{{ formatNum(item.quantity * item.price) }} ₽</td>
    <td><LinkButton color="gray">Заменить материал</LinkButton></td>
    <td>{{ item.percent ? item.percent + '%' : '' }}</td>
  </tr>
</template>

<style lang="scss" scoped>
td {
  border: 1px solid var(--table-color);
  min-height: 60px;
  height: 60px;
  padding: 0 15px;
  font-size: 16px;
  line-height: calc(20 / 16 * 100%);
  font-family: 'Jost';
  text-align: center;
  box-sizing: border-box;

  &:nth-child(1) {
    max-width: 260px;
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
    max-width: 165px;
  }
  &:nth-child(7) {
    max-width: 82px;
  }
}

td {
  &:nth-child(1) {
    text-align: left;
  }
}
</style>

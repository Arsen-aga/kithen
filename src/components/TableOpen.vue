<script setup>
import { ref, watch } from 'vue'
import LinkButton from '@/components/UI/LinkButton.vue'
import TableItem from '@/components/TableItem.vue'

const props = defineProps({
  isOpenAllTable: {
    type: Boolean,
    default: false,
  },
  tableItems: {
    type: Object,
    required: true,
  },
})

const isOpenTable = ref(props.isOpenAllTable)

watch(
  () => props.isOpenAllTable,
  (newValue) => {
    isOpenTable.value = newValue
  }
)

const openTable = () => {
  isOpenTable.value = !isOpenTable.value
}
</script>

<template>
  <div class="table-block__wrapper">
    <LinkButton class="table-block__btn" @click="() => openTable()"
      >{{ isOpenTable ? 'Скрыть' : 'Раскрыть' }} перечень</LinkButton
    >
    <table class="table-block" v-show="isOpenTable">
      <thead class="table-block__head">
        <tr>
          <th>Наименование</th>
          <th>Ед</th>
          <th>Кол-во</th>
          <th>Цена</th>
          <th>Сумма</th>
          <th>Замена материала</th>
          <th>Доп. выгода</th>
        </tr>
      </thead>
      <tbody class="table-block__body">
        <TableItem :table-items="tableItems" />
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.table-block {
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
  &__btn {
    margin-bottom: 15px;
  }

  &__head {
    background-color: var(--page-bg);
  }

  th,
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

  th {
    font-weight: 500;
    padding: 6px 15px;
  }

  td {
    &:nth-child(1) {
      text-align: left;
    }
  }
}
</style>

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

const emit = defineEmits(['update-table-state'])
const isOpenTable = ref(props.isOpenAllTable)

watch(
  () => props.isOpenAllTable,
  (newValue) => {
    isOpenTable.value = newValue
  }
)

const openTable = () => {
  isOpenTable.value = !isOpenTable.value
  emit('update-table-state', isOpenTable.value)
}
</script>

<template>
  <div class="table-block__wrapper">
    <LinkButton class="table-block__btn" @click="() => openTable()"
      >{{ isOpenTable ? 'Скрыть' : 'Раскрыть' }} перечень</LinkButton
    >
    <div class="table-block" v-show="isOpenTable">
      <div class="table-block__head">
        <div class="table-block__tr">
          <div class="table-block__th">Наименование</div>
          <div class="table-block__th">Ед</div>
          <div class="table-block__th">Кол-во</div>
          <div class="table-block__th">Цена</div>
          <div class="table-block__th">Сумма</div>
          <div class="table-block__th">Замена материала</div>
          <div class="table-block__th">Доп. выгода</div>
        </div>
      </div>
      <div class="table-block__body">
        <TableItem :table-items="tableItems" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-block {
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  overflow-y: auto;
  max-width: 930px;

  &__btn {
    margin-bottom: 15px;
  }

  &__head {
    background-color: var(--page-bg);
  }

  &__tr {
    display: flex;
  }

  &__th {
    width: 100%;
    border: 1px solid var(--table-color);
    min-height: 60px;
    height: 60px;
    padding: 0 15px;
    font-size: 16px;
    line-height: calc(20 / 16 * 100%);
    font-family: 'Jost';
    text-align: center;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;

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

  &__th {
    font-weight: 500;
    padding: 6px 15px;
  }
}
</style>

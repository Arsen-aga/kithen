<script setup>
import { computed, ref } from 'vue'
import { useResultItems } from '@/stores/result'
import MainButton from '@/components/UI/MainButton.vue'
import TableOpen from '@/components/TableOpen.vue'
import TitileDotsPrice from '@/components/UI/TitileDotsPrice.vue'
import { findItemToId } from '@/helpers/findItemToId'
const { resultItems } = useResultItems()

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const tablesStates = ref(props.items.map(() => false))
const openTable = () => {
  const allOpen = tablesStates.value.every((state) => state)
  tablesStates.value = tablesStates.value.map(() => !allOpen)
}

const allTablesOpen = computed(() => tablesStates.value.every((state) => state))
const updateTableState = (index, state) => {
  tablesStates.value[index] = state
}
</script>

<template>
  <div class="accordion-smeta">
    <MainButton class="accordion-smeta__open-all" @click="openTable">
      {{ allTablesOpen ? 'Скрыть' : 'Развернуть' }} все разделы
    </MainButton>
    <div class="accordion-smeta__items">
      <div class="accordion-smeta__item" v-for="(item, index) in items" :key="item.id">
        <TitileDotsPrice :title="item.title" :price="findItemToId(resultItems[0].elems, item.id)?.price" />
        <TableOpen
          v-if="item.table.length"
          :is-open-all-table="tablesStates[index]"
          :tableItems="item.table"
          class="accordion-smeta__item-bottom"
          @update-table-state="(state) => updateTableState(index, state)"
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

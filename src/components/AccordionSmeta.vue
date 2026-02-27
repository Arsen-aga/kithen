<script setup>
import { computed, watch, ref } from 'vue'
import MainButton from '@/components/UI/MainButton.vue'
import TableOpen from '@/components/TableOpen.vue'
import TitileDotsPrice from '@/components/UI/TitileDotsPrice.vue'
import { useSmetaStore } from '@/stores/smeta/index'

const smetaStore = useSmetaStore()
const items = computed(() => smetaStore.smetaTables || []);

const tablesStates = ref([])
console.log('tablesStates.value', tablesStates.value);
const openTable = () => { 
  const allOpen = tablesStates.value.every((state) => state)
  tablesStates.value = tablesStates.value.map(() => !allOpen)
}

const allTablesOpen = computed(() => tablesStates.value.every((state) => state))
const updateTableState = (index, state) => {
  tablesStates.value[index] = state
}
watch(items, (newItems) => {
  tablesStates.value = newItems.map(() => false)
}, { immediate: true })
</script>

<template>
  <div class="accordion-smeta">
    <MainButton class="accordion-smeta__open-all" @click="openTable">
      {{ allTablesOpen ? 'Скрыть' : 'Развернуть' }} все разделы
    </MainButton>
    <div class="accordion-smeta__items">
      <div class="accordion-smeta__item" v-for="(item, index) in items" :key="item.id">
        <TitileDotsPrice :title="item.title" :price="item?.price" />
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

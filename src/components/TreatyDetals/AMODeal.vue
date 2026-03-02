<script setup>
import SelectItems from '@/components/UI/SelectItems.vue'
import IconRefresh from '@/components/icons/IconRefresh.vue'
import LinkButton from '@/components/UI/LinkButton.vue'
import { useSmetaStore } from '@/stores/smeta/index'
const smetaStore = useSmetaStore()
const defaultItems = [
  {
    id: 0,
    title: 'Название сделки',
  },
  {
    id: 1,
    title: 'Название сделка',
  },
]

const updateItems = (item) => {
  console.log('item', item);
}
</script>

<template>
  <div class="amo-deal">
    <SelectItems class="amo-deal__select" @updateItems="updateItems" :items="defaultItems" />
    <div class="amo-deal__refresh">
      <IconRefresh />
      <LinkButton>Обновить</LinkButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.amo-deal {
  &__select {
    width: 100%;
    height: 76px;
    padding: 26px 25px 24px;
    background-color: var(--light-color);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    font-family: 'Jost';
    font-weight: 400;
    font-size: 18px;
    line-height: calc(26 / 18 * 100%);
    color: var(--default-color);
  }
  &__refresh {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }
}
</style>

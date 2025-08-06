<script setup>
import { ref } from 'vue'
import { formatNum } from '@/helpers/formatNum'
import CheckboxButtonIcon from '@/components/UI/CheckboxButtonIcon.vue'
import CounterBlock from '@/components/UI/CounterBlock.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update-price'])

const isChecked = ref(props.items.map(() => false))
const counts = ref(props.items.map(() => 1))

const updatePriceInParent = (index) => {
  const price = props.items[index].price
  const count = counts.value[index]
  const itemPrice = price * count
  emit('update-price', isChecked.value[index] ? itemPrice : -itemPrice)
}

const toggleItem = (index) => {
  isChecked.value[index] = !isChecked.value[index]
  updatePriceInParent(index)
}

const countUpdate = (index, newCount) => {
  const oldCount = counts.value[index]
  counts.value[index] = newCount

  if (isChecked.value[index]) {
    const priceDifference = (newCount - oldCount) * props.items[index].price
    emit('update-price', priceDifference)
  }
}
</script>

<template>
  <div
    class="scroll-table-item__tr"
    v-for="(item, index) in items"
    :key="item.key"
    :class="{ active: isChecked[index] }"
  >
    <div class="scroll-table-item__td">
      <CheckboxButtonIcon :checked="isChecked[index]" @click="toggleItem(index)" />
    </div>
    <div class="scroll-table-item__td">{{ item.title }}</div>
    <div class="scroll-table-item__td">
      <CounterBlock
        class="selected-item__counter"
        v-model="counts[index]"
        @update-price="(count) => countUpdate(index, count)"
      />
    </div>
    <div class="scroll-table-item__td">{{ formatNum(item.price, 0) }} ₽</div>
  </div>
</template>

<style lang="scss" scoped>
.scroll-table-item {
  &__tr {
    display: flex;

    &.active {
      background-color: #faf1e5;
    }
  }
  &__td {
    border: 1px solid var(--table-color);
    min-height: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
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

  &__td {
    &:nth-child(2) {
      text-align: left;
      justify-content: start;
    }
  }
}
</style>

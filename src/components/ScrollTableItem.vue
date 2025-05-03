<script setup>
import { ref } from 'vue'
import { formatNum } from '@/helpers/formatNum'
import CheckboxButtonIcon from '@/components/UI/CheckboxButtonIcon.vue'
import CounterBlock from '@/components/UI/CounterBlock.vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const isChecked = ref(false)
const checkItem = () => {
  isChecked.value = !isChecked.value
}
</script>

<template>
  <div class="scroll-table-item__tr" v-for="item in items" :key="item.key">
    <div class="scroll-table-item__td">
      <CheckboxButtonIcon :checked="isChecked" @click="checkItem" />
    </div>
    <div class="scroll-table-item__td">{{ item.title }}</div>
    <div class="scroll-table-item__td"><CounterBlock class="selected-item__counter" /></div>
    <div class="scroll-table-item__td">{{ formatNum(item.price, false) }} ₽</div>
  </div>
</template>

<style lang="scss" scoped>
.scroll-table-item {
  &__tr {
    display: flex;
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

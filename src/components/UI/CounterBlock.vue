<script setup>
import { ref } from 'vue'
defineProps({})

const counter = ref(1)
const increment = () => {
  counter.value++
}
const decrement = () => {
  counter.value--
}
</script>

<template>
  <div class="counter">
    <button class="counter__btn counter__decrement" @click="decrement">
      <div class="bar"></div>
    </button>
    <p class="counter__num">{{ counter }}</p>
    <button class="counter__btn counter__increment" @click="increment">
      <div class="bar"></div>
      <div class="bar"></div>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100px;
  width: 100%;

  &__btn {
    position: relative;
    min-width: 28px;
    min-height: 28px;
    max-width: 28px;
    max-height: 28px;
    width: 28px;
    height: 28px;
    border-radius: 5px;
    background-color: rgba($color: #464451, $alpha: 0.1);
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    .bar {
      position: absolute;
      width: 11.67px;
      height: 2.33px;
      background-color: var(--default-color);
      border-radius: 10px;
    }
  }

  &__increment {
    .bar:last-child {
      rotate: 90deg;
    }
  }
}
</style>

<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="icon-plus">
    <div class="icon-plus__bar" :class="{ active: open }"></div>
    <div class="icon-plus__bar" :class="{ active: open }"></div>
  </div>
</template>

<style lang="scss" scoped>
.icon-plus {
  height: 17px;
  width: 17px;
  position: relative;

  &__bar {
    background-color: var(--plus-color);
    width: 3px;
    height: 17px;
    border-radius: 10px;
    position: absolute;
    transition: all 0.3s ease-in-out;

    &.active {
      background-color: var(--light-color);
    }

    &:first-child {
      rotate: 90deg;
      left: 43%;
    }
    &:last-child {
      left: 45%;
      &.active {
        rotate: 90deg;
        left: 43%;
      }
    }
  }
}
</style>

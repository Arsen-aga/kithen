<script setup>
defineProps({
  checked: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="checkbox-button" :class="{ active: checked }">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.checkbox-button {
  display: flex;
  gap: 7px;
  align-items: center;
  font-family: 'Jost';
  font-weight: 400;
  font-size: 18px;
  line-height: calc(26 / 18 * 100%);
  color: var(--gray-color);
  cursor: pointer;

  &.active {
    color: var(--default-color);
  }
}
</style>

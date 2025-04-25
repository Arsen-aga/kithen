<script setup>
defineProps({
  color: {
    type: String,
    default: 'red',
  },
})
</script>

<template>
  <button class="link-btn" :class="color">
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
.link-btn {
  background-color: transparent;
  font-style: normal;
  font-family: var(--font-default);
  font-size: 16px;
  font-weight: 400;
  text-decoration: underline;
  text-underline-offset: 3px;
  color: var(--primary-color);
  border: none;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &.orange {
    color: var(--accent-color);
  }
  &.gray {
    color: var(--gray-color);
  }
}
</style>

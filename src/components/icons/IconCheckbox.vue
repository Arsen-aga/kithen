<script setup>
defineProps({
  color: {
    type: String,
    default: 'white',
  },
  isChecked: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <svg
    :class="{ show: isChecked }"
    width="10"
    height="8"
    viewBox="0 0 10 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.25 3.99821L3.75114 6.85971L8.75342 1.13672"
      :stroke="color"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style lang="scss" scoped>
svg {
  scale: 0;
  transition: scale 0.3s ease-in-out;

  &.show {
    scale: 1;
  }
}
</style>

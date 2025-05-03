<script setup>
import CalculateBlock from '@/components/CalculateBlock.vue'
import ReviewBlock from '@/components/ReviewBlock.vue'
</script>

<template>
  <CalculateBlock class="app__calculate" />
  <ReviewBlock />
</template>

<style lang="scss" scoped>
.app {
  &__calculate {
    position: relative;
  }
}
</style>

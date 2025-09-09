<script setup>
import CalculateBlock from '../components/CalculateBlock.vue'
import ReviewBlock from '../components/ReviewBlock.vue'
</script>
<template>
  <div class="app-component">
    <CalculateBlock />
    <ReviewBlock />
  </div>
</template>
<style lang="scss" scoped>
.app-component {
  max-width: 1920px;
  padding: 20px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1320px) minmax(0, 540px);
  gap: 20px;
  /* position: relative; */
}
</style>

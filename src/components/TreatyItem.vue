<script setup>
defineProps({
  title: {
    type: String,
  },
})

</script>

<template>
  <div class="treaty-item">
    <h6 class="treaty-item__title" v-if="title">
      {{ title }}
    </h6>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.treaty-item__title {
    font-family: 'Jost';
    font-weight: 600;
    font-size: 12px;
    line-height: calc(20 / 12 * 100%);
    text-transform: uppercase;
    margin-bottom: 5px;
  }

</style>

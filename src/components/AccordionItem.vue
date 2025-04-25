<script setup>
import { ref } from 'vue'
import IconLink from '@/components/icons/IconLink.vue'
import IconPlus from '@/components/icons/IconPlus.vue'

defineProps({
  content: {
    type: Object,
  },
})

const isOpen = ref(false)
const open = () => (isOpen.value = !isOpen.value)
</script>

<template>
  <div class="accordion-item">
    <div class="accordion-item__header" :class="{ active: isOpen && !content.link }" @click="open">
      <h2 class="accordion-item__title">{{ content.title }}</h2>
      <IconLink v-if="content.link" />
      <IconPlus :open="isOpen" v-else />
    </div>
    <div v-show="!content.link" class="accordion-item__content" :class="{ active: isOpen }">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.accordion-item {
  &__header {
    background: var(--page-bg);
    border-radius: 14px;
    padding: 22px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &.active {
      background-color: var(--accent-color);
      color: var(--light-color);
    }
  }

  &__title {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 18px;
    line-height: calc(26 / 18 * 100%);
    transition: all 0.3s ease-in-out;
  }

  &__content {
    display: none;

    &.active {
      display: block;
    }
  }
}
</style>

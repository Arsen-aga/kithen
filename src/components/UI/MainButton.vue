<script setup>
import IconArrowsBtn from '@/components/icons/IconArrowsBtn.vue'

defineProps({
  sizeButton: {
    type: String,
    default: '',
  },
  showArrows: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <button class="main-btn" :class="sizeButton">
    <IconArrowsBtn v-if="showArrows" />
    <span>
      <slot></slot>
    </span>
  </button>
</template>

<style lang="scss" scoped>
.main-btn {
  display: flex;
  justify-content: center;
  background-color: transparent;
  align-items: center;
  gap: 10px;
  padding: 16px 15px 14px;
  border: 1px solid rgba($color: #000000, $alpha: 0.1);
  border-radius: 12px;

  span {
    font-family: 'Jost';
    font-weight: 700;
    font-size: 12px;
    line-height: calc(20 / 12 * 100%);
    text-align: center;
    text-transform: uppercase;
    opacity: 0.4;
  }

  &.text-red {
    border-color: var(--primary-color);
    color: var(--primary-color);

    span {
      opacity: 1;
    }
  }

  &.text-orange {
    border-color: var(--accent-color);
    color: var(--accent-color);

    span {
      opacity: 1;
    }
  }

  &.bg-red {
    border: none;
    background-color: var(--primary-color);
    color: var(--light-color);

    span {
      opacity: 1;
    }
  }

  &.middle-btn {
    padding: 15px;
  }
  &.big-btn {
    padding: 36px;
    max-width: 460px;
    width: 100%;

    span {
      font-size: 16px;
      line-height: calc(24 / 16 * 100%);
    }
  }
}
</style>

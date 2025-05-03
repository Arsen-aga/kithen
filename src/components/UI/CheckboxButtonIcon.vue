<script setup>
import IconCheckbox from '@/components/icons/IconCheckbox.vue'

defineProps({
  checked: {
    type: Boolean,
    required: true,
  },
})
</script>

<template>
  <div class="checkbox__wrapper">
    <div class="checkbox" :class="{ active: checked }">
      <IconCheckbox v-show="checked" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.checkbox {
  width: 16.5px;
  height: 16.5px;
  border: 1.6px solid #dedede;
  transition: all 0.3s ease-in-out;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  &__wrapper {
    height: 22px;
    width: 22px;
    min-width: 22px;
    min-height: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: -2px;
  }

  &.active {
    background-color: var(--primary-color);
    border: 0px;
  }
}
</style>

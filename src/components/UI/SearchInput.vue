<script setup>
import IconSearch from '@/components/icons/IconSearch.vue'
import { computed } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Поиск...',
  },
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const searchQuery = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>
<template>
  <label class="search-input">
    <IconSearch class="search-input__icon" />
    <input class="search-input__input" type="text" :placeholder="placeholder" v-model="searchQuery" />
  </label>
</template>
<style lang="scss" scoped>
.search-input {
  position: relative;
  display: block;

  &__icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 15px;
  }
  &__input {
    width: 100%;
    height: 50px;
    background-color: #fafbfc;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 15px 20px 13px 43px;
    font-family: 'Jost';
    font-weight: 400;
    font-size: 14px;
    line-height: calc(22 / 14 * 100%);
    color: var(--default-color);
  }
}
</style>

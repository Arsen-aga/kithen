<script setup>
import { ref } from 'vue'
import SettingButton from '@/components/UI/SettingButton.vue'
import TitileDotsPrice from '@/components/UI/TitileDotsPrice.vue'
import TreatyItem from '@/components/TreatyItem.vue'

defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const isOpenSettings = ref(false)
const openSettings = () => (isOpenSettings.value = !isOpenSettings.value)
</script>

<template>
  <div class="treaty-detals">
    <div class="treaty-detals__top">
      <TitileDotsPrice :title="item.title" :dots="false" />
      <SettingButton @click="openSettings" :is-active="isOpenSettings" />
    </div>
    <div class="treaty-detals__items">
      <TreatyItem v-for="elem in item.elems" :key="elem.id" :item="elem" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.treaty-detals {
  background-color: var(--page-bg);
  border-radius: 14px;
  padding: 30px;

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
  }

  &__items {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px 10px;
  }
}
</style>

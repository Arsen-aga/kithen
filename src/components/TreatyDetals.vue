<script setup>
import { ref } from 'vue'
import SettingButton from '@/components/UI/SettingButton.vue'
import TitileDotsPrice from '@/components/UI/TitileDotsPrice.vue'
import TreatyItem from '@/components/TreatyItem.vue'
import SettingModal from '@/components/SettingModal.vue'

defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const isOpenSettings = ref(false)
const openSettings = () => {
  isOpenSettings.value = !isOpenSettings.value
}

const closeSettings = () => {
  isOpenSettings.value = false
}
</script>

<template>
  <div class="treaty-detals">
    <div class="treaty-detals__top">
      <TitileDotsPrice :title="item.title" :dots="false" />
      <div class="treaty-detals__settings">
        <SettingButton class="treaty-detals__settings-btn" @click="openSettings" :is-active="isOpenSettings" />
        <SettingModal
          class="treaty-detals__settings-modal"
          :is-open="isOpenSettings"
          @update-open-modal="closeSettings"
        />
      </div>
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

  &__settings {
    position: relative;
  }
  &__settings-modal {
    left: 0;
    bottom: 0;
    transform: translateY(calc(100% + 15px)) translateX(-45%);
  }
}
</style>

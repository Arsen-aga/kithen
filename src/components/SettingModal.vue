<script setup>
import { ref, onBeforeUnmount } from 'vue'
import SelectItems from '@/components/UI/SelectItems.vue'

defineProps({
  isOpen: Boolean,
})

const emit = defineEmits(['update-open-modal'])
const handleClickOutside = (event) => {
  const selectElement = event.target.closest('.treaty-detals__settings')
  if (!selectElement) {
    emit('update-open-modal')
  }
}

document.addEventListener('click', handleClickOutside)

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const content = ref({
  id: 0,
  info: 'Жесткая упаковка фасадов/столешниц включена в стоимость',
  items: [
    {
      id: 0,
      title: '% для дизайнера',
      options: [
        { id: 0, title: 0 },
        { id: 1, title: 5 },
        { id: 2, title: 10 },
        { id: 3, title: 15 },
      ],
    },
    {
      id: 1,
      title: 'Срок доставки груза из города Екатеринбург в город клиента',
      options: [
        { id: 0, title: '1 день' },
        { id: 1, title: '2 дня' },
        { id: 2, title: '5 дней' },
        { id: 3, title: '15 дней' },
      ],
    },
  ],
})
</script>

<template>
  <div class="setting-modal" v-show="isOpen">
    <div class="setting-modal__inner">
      <div class="setting-modal__item" v-for="item in content.items" :key="item.id">
        <p class="setting-modal__item-title">
          {{ item.title }}
        </p>
        <SelectItems class="setting-modal__item-select" :items="item.options" :class-arrow="'rigth20'" />
      </div>
      <p class="setting-modal__text">
        {{ content.info }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.setting-modal {
  max-width: 252px;
  min-width: 252px;
  z-index: 10;
  width: 100%;
  background-color: var(--light-color);
  box-shadow: 0px 10px 60px rgba(163, 169, 183, 0.15);
  position: absolute;

  &::before {
    position: absolute;
    content: '';
    display: block;
    width: 17px;
    height: 17px;
    rotate: 45deg;
    top: 0;
    left: 50%;
    transform: translateY(-0%) translateX(-70%);
    background-color: var(--light-color);
    z-index: -1;
  }

  &__inner {
    padding: 20px;
    display: grid;
    gap: 15px;
  }

  &__item-title {
    font-family: 'Jost';
    font-weight: 600;
    font-size: 12px;
    line-height: calc(20 / 12 * 100%);
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  &__item-select {
    width: 212px;
    height: 46px;
    background-color: #fafbfc;
    border: 1px solid #f1f1f1;
    border-radius: 12px;
    padding: 11px 20px;
  }
}
</style>

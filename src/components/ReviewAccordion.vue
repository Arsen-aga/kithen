<script setup>
import { formatNum } from '@/helpers/formatNum'
import { ref, watch } from 'vue'
import IconArrow from './icons/IconArrow.vue'
import ReviewElem from './ReviewElem.vue'
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  value: {
    type: [String, Number],
  },
})

const isOpenList = ref(false)
const toggleList = () => {
  isOpenList.value = !isOpenList.value
}

watch(
  () => props.item.id,
  (newId) => {
    isOpenList.value = newId === 4 || newId === 5
  },
  { immediate: true }
)
</script>

<template>
  <div class="review-accordion">
    <div class="review-accordion__header">
      <h2 class="review-accordion__title" :class="{ uppercase: item.id === 6 }">{{ item.title }}:</h2>
      <p class="review-accordion__value" :class="{ orange: item.id === 5 }">
        {{ typeof value === 'number' ? formatNum(value, false) + ' ₽' : value }}
      </p>
      <div v-if="item.id !== 6" class="review-accordion__open-btn" :class="{ rotate: isOpenList }" @click="toggleList">
        <IconArrow />
      </div>
    </div>
    <div v-show="item.elems && isOpenList" class="review-accordion__body">
      <div class="review-accordion__items">
        <ReviewElem
          class="review-accordion__item"
          v-for="elem in item.elems"
          :key="elem.id"
          :item="elem"
          :value="elem.price ?? elem.days"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.review-accordion {
  &__header {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  &__title {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 24px;
    line-height: calc(32 / 24 * 100%);
    margin-top: 5px;
    &.uppercase {
      text-transform: uppercase;
    }
  }

  &__value {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 30px;
    line-height: calc(38 / 30 * 100%);
    text-align: right;
    margin-left: auto;

    &.orange {
      color: var(--accent-color);
    }
  }

  &__open-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    background-color: rgba($color: #464451, $alpha: 0.1);
    border-radius: 5px;
    margin-top: 5px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &.rotate {
      rotate: 180deg;
    }

    &:hover {
      scale: 1.1;
    }
  }

  &__body {
    padding-top: 10px;
  }

  &__item {
    padding: 10px 34px 10px 20px;
    border-bottom: 1px solid rgba($color: #464451, $alpha: 0.2);

    &:last-child {
      padding-bottom: 0;
      border: none;
    }
  }
}
</style>

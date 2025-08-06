<script setup>
import { ref } from 'vue'
import { formatNum } from '@/helpers/formatNum'
import LinkButton from './UI/LinkButton.vue'

defineProps({
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
</script>

<template>
  <div class="review-elem">
    <div class="review-elem__header">
      <h5 class="review-elem__title" :class="{ bold: item.discount }">{{ item.title }}:</h5>
      <p class="review-elem__value">{{ typeof value === 'number' ? formatNum(value, 0) + ' ₽' : value }}</p>
    </div>
    <div v-if="item.items || item.list" class="review-elem__body">
      <div class="review-elem__items" v-show="isOpenList">
        <div class="review-elem__item" v-for="elem in item.items" :key="elem.id">
          <div class="review-elem__item-info">
            <h6 class="review-elem__item-title">{{ elem.title }}</h6>
            <p class="review-elem__item-value">{{ formatNum(elem.price, false) }} ₽</p>
          </div>
        </div>
        <div class="review-elem__list">
          <div class="review-elem__list-info" v-for="point in item.list" :key="point.id">
            <h6 class="review-elem__list-title">{{ point.title }}{{ point.price ? ':' : '' }}</h6>
            <p class="review-elem__list-value" v-if="point.price">{{ formatNum(point.price, false) }} ₽</p>
          </div>
        </div>
      </div>
      <LinkButton class="review-elem__btn" @click="toggleList"
        >{{ isOpenList ? 'Свернуть' : 'Раскрыть' }} информацию</LinkButton
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.review-elem {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-family: 'Jost';
    font-weight: 400;
    font-size: 20px;
    line-height: calc(28 / 20 * 100%);

    &.bold {
      font-weight: 500;
    }
  }

  &__value {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 20px;
    line-height: calc(28 / 20 * 100%);
    text-align: right;
  }

  &__body {
    padding-top: 10px;
    padding-left: 20px;
  }

  &__items {
    display: grid;
    gap: 5px;
    margin-bottom: 5px;
  }

  &__item-info {
    color: var(--gray-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__list-title,
  &__item-title {
    font-family: 'Jost';
    font-weight: 400;
    font-size: 16px;
    line-height: calc(24 / 16 * 100%);
  }

  &__item-value,
  &__list-value {
    font-family: 'Jost';
    font-weight: 400;
    font-size: 16px;
    line-height: calc(24 / 16 * 100%);
    text-align: right;
  }

  &__list {
    display: grid;
  }

  &__list-info {
    display: inline-flex;
    gap: 3px;
    padding-left: 10px;
    position: relative;

    &:last-child {
      h6,
      p {
        font-weight: 500;
      }
    }

    &::before {
      position: absolute;
      content: '';
      min-width: 4px;
      min-height: 4px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--primary-color);
      left: 0;
      top: 11px;
    }
  }
}
</style>

<script setup>
import { formatNum } from '@/helpers/formatNum'
import { ref, watch } from 'vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import ReviewElem from '@/components/ReviewElem.vue'
import LinkButton from '@/components/UI/LinkButton.vue'
import CustomCalendar from '@/components/UI/CustomCalendar.vue'
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

const formatDateNotYear = (date) => {
  return date.toLocaleString('default', { day: 'numeric', month: 'long' })
}

const startDate = ref(new Date())
const isOpenCalendar = ref(false)
const openCalendar = () => {
  isOpenCalendar.value = !isOpenCalendar.value
}

watch(
  () => props.item.id,
  (newId) => {
    isOpenList.value = newId === 600
  },
  { immediate: true }
)
</script>

<template>
  <div class="review-accordion">
    <div class="review-accordion__header">
      <h2 class="review-accordion__title" :class="{ uppercase: item.id === 700 }">{{ item.title }}:</h2>
      <p class="review-accordion__value" :class="{ orange: item.id === 600 }">
        {{ typeof value === 'number' ? formatNum(value, true, 0) + ' ₽' : value }}
      </p>
      <div
        v-if="item.id !== 700"
        class="review-accordion__open-btn"
        :class="{ rotate: isOpenList }"
        @click="toggleList"
      >
        <IconArrow />
      </div>
    </div>
    <div v-show="item.elems && isOpenList" class="review-accordion__body">
      <div class="review-accordion__items">
        <ReviewElem
          class="review-accordion__item"
          :class="{ dateTrue: item.id === 500 }"
          v-for="elem in item.elems"
          :key="elem.id"
          :item="elem"
          :value="elem.price ?? elem.days"
        />
      </div>
    </div>
    <div class="review-accordion__shipment">
      <p v-if="item.id === 500" class="review-accordion__bottom">
        Ваша кухня будет готова к отгрузке<br />
        с фабрики
        <LinkButton class="review-accordion__date" color="orange" @click="openCalendar">{{
          formatDateNotYear(startDate)
        }}</LinkButton>
      </p>
      <CustomCalendar
        class="review-accordion__calendar"
        v-show="isOpenCalendar"
        :isShow="isOpenCalendar"
        :changeDate="startDate"
        @update:changeDate="startDate = $event"
        @update:isShow="isOpenCalendar = $event"
      />
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

  &__item {
    padding: 10px 34px 10px 20px;
    border-bottom: 1px solid rgba($color: #464451, $alpha: 0.2);

    &:last-child {
      padding-bottom: 0;
      border: none;
    }

    &.dateTrue {
      padding-bottom: 10px;
      border-bottom: 1px solid rgba($color: #464451, $alpha: 0.2);
    }
  }

  &__bottom {
    margin-top: 10px;
    font-family: 'Jost';
    font-weight: 400;
    font-size: 20px;
    line-height: calc(28 / 20 * 100%);
  }

  &__date {
    display: inline-flex;
    font-size: 20px;
    line-height: calc(28 / 20 * 100%);
  }

  &__shipment {
    position: relative;
  }

  &__calendar {
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateY(100%);
    z-index: 10;
  }
}
</style>

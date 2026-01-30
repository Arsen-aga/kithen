<script setup>
import { formatNum } from '@/helpers/formatNum'
import CheckboxButtonIcon from '@/components/UI/CheckboxButtonIcon.vue'
import CounterBlock from '@/components/UI/CounterBlock.vue'
import { computed } from 'vue'
import { useSmetaStore } from '@/stores/smeta'
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  checkState: {
    type: Boolean,
  },
})
const smetaStore = useSmetaStore()
const emit = defineEmits(['update-check-state'])

const checked = computed({
  get: () => props.checkState || false,
  set: (newValue) => {
    console.log('newValue', newValue);
    emit('update-check-state', newValue)
  }
})


const updateCountInProduct = (newCount) => {
  smetaStore.changeProductCount(props.item.id, newCount)
  console.log('newCount', newCount);
}

const checkItem = () => {
  console.log('checked.value', checked.value);
  checked.value = !checked.value
  console.log('checked.value', checked.value);
}
console.log('props.item', props.item);
</script>

<template>
  <div class="selected-item">
    <CheckboxButtonIcon :checked="checked" @click="checkItem" />
    <div class="selected-item__inner">
      <div class="selected-item__wrapper-img">
        <img class="selected-item__img" :src="item.images?.url || '../src/assets/images/no-img.png'" :alt="item.Name" />
      </div>
      <div class="selected-item__info">
        <h4 class="selected-item__title" v-html="item.Name"></h4>
        <ul class="selected-item__list" v-if="item.options.length">
          <li class="selected-item__point" v-for="option in item.options" :key="option.id">
            <span>{{ option.option }}:</span> {{ option.info }}
          </li>
        </ul>
      </div>
    </div>
    <div class="selected-item__right">
      <p class="selected-item__old-price" v-if="item.Price">{{ formatNum(item.price_old ? item.price_old : item.Price_0, 0) }} ₽</p>
      <p class="selected-item__price">{{ formatNum(item.price_new ? item.price_new : item.Price, 0) }} ₽</p>
      <CounterBlock class="selected-item__counter" :counter="item.Count" @update-count="updateCountInProduct" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.selected-item {
  padding: 15px 0;
  padding-right: 15px;
  border-bottom: 1px solid rgba($color: #464451, $alpha: 0.1);
  display: grid;
  grid-template-columns: minmax(0, 22px) minmax(0, 1fr) minmax(0, 125px);
  gap: 15px;

  &__inner {
    display: flex;
    gap: 20px;
  }

  &__wrapper-img {
    min-width: 240px;
    min-height: 240px;
    max-width: 240px;
    max-height: 240px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__title {
    font-family: 'Jost';
    font-weight: 400;
    font-size: 20px;
    line-height: calc(28 / 20 * 100%);
  }

  &__list {
    margin-top: 10px;
    display: grid;
    gap: 3px;
  }

  &__point {
    span {
      color: var(--gray-color);
    }
  }

  &__right {
    display: flex;
    flex-direction: column;
  }

  &__old-price {
    font-family: 'Jost';
    font-weight: 400;
    font-size: 18px;
    line-height: calc(26 / 18 * 100%);
    text-decoration: line-through;
    color: var(--gray-color);
  }
  &__price {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 26px;
    line-height: calc(34 / 26 * 100%);
    color: var(--accent-color);
    text-wrap-mode: nowrap;
  }

  &__counter {
    margin-top: auto;
  }
}
</style>

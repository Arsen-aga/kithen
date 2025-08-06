<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  minPriceValue: Number,
  maxPriceValue: Number,
})

const emit = defineEmits(['update:minPrice', 'update:maxPrice'])

const minGap = 1500
const sliderMinValue = props.minPriceValue
const sliderMaxValue = props.maxPriceValue

const minPrice = ref(props.minPriceValue)
const maxPrice = ref(props.maxPriceValue)

watch(
  () => minPrice.value,
  (val) => {
    if (val !== undefined) {
      emit('update:minPrice', val)
    }
  }
)
watch(
  () => maxPrice.value,
  (val) => {
    if (val !== undefined) {
      emit('update:maxPrice', val)
    }
  }
)
// watch(
//   () => props.minPriceValue,
//   (val) => {
//     if (val !== undefined && val !== minPrice.value) {
//       minPrice.value = val
//       emit('update:minPrice', minPrice.value)
//     }
//   }
// )
// watch(
//   () => props.maxPriceValue,
//   (val) => {
//     if (val !== undefined && val !== maxPrice.value) {
//       maxPrice.value = val
//       emit('update:maxPrice', maxPrice.value)
//     }
//   }
// )

// Форматируем цены с разделением пробелами по тысячам
const formatPrice = (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const formattedMinPrice = computed(() => formatPrice(minPrice.value))
const formattedMaxPrice = computed(() => formatPrice(maxPrice.value))

// Обновление положения активной части ползунка
const trackStyle = computed(() => {
  const minPercent = ((minPrice.value - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100
  const maxPercent = ((maxPrice.value - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100
  return {
    left: `${minPercent}%`,
    right: `${100 - maxPercent}%`,
  }
})

// Обработка ввода в текстовые поля
function updateMinPrice(event) {
  let val = parseInt(event.target.value.replace(/\s+/g, '') || 0)
  if (val < sliderMinValue) val = sliderMinValue
  if (val > maxPrice.value - minGap) val = maxPrice.value - minGap
  minPrice.value = val
  emit('update:minPrice', minPrice.value)
}

function updateMaxPrice(event) {
  let val = parseInt(event.target.value.replace(/\s+/g, '') || 0)
  if (val > sliderMaxValue) val = sliderMaxValue
  if (val < minPrice.value + minGap) val = minPrice.value + minGap
  maxPrice.value = val
  emit('update:maxPrice', maxPrice.value)
}

// Обработка изменения ползунков
function onSliderInput() {
  if (maxPrice.value - minPrice.value < minGap) {
    if (event.target.classList.contains('min-val')) {
      minPrice.value = maxPrice.value - minGap
    }
  }
}
</script>

<template>
  <div class="range-slider">
    <div class="range-slider__inputs">
      <input type="text" class="range-slider__inp" :value="formattedMinPrice" @input="updateMinPrice" />
      <svg width="9" height="1" viewBox="0 0 9 1" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 1V0H9V1H0Z" fill="#464451" />
      </svg>
      <input type="text" class="range-slider__inp" :value="formattedMaxPrice" @input="updateMaxPrice" />
    </div>
    <div class="range-slider__slider">
      <input
        type="range"
        class="range-slider__min-val"
        :min="sliderMinValue"
        :max="sliderMaxValue"
        v-model.number="minPrice"
        @input="onSliderInput"
      />
      <input
        type="range"
        class="range-slider__max-val"
        :min="sliderMinValue"
        :max="sliderMaxValue"
        v-model.number="maxPrice"
        @input="onSliderInput"
      />
      <div class="range-slider__slider-track" :style="trackStyle"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.range-slider {
  &__inputs {
    display: flex;
    gap: 5px;
    align-items: center;
    margin-bottom: 20px;
  }

  &__inp {
    max-width: 95px;
    height: 30px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    text-align: center;
    padding: 3px;
    font-family: 'Jost';
    font-weight: 500;
    font-size: 16px;
    line-height: calc(24 / 16 * 100%);
  }

  &__slider {
    position: relative;
    width: 100%;
    height: 6px;
    background-color: #e4e4ef;
    border-radius: 4px;

    input[type='range'] {
      position: absolute;
      width: 100%;
      pointer-events: none;
      -webkit-appearance: none;
      background: none;
      top: 50%;
      transform: translateY(-50%);
      height: 5px;
      margin: 0;
      z-index: 1;
    }

    input[type='range']::-webkit-slider-thumb {
      pointer-events: all;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 4px solid var(--primary-color);
      background-color: var(--light-color);
      -webkit-appearance: none;
      cursor: pointer;
      box-shadow: 0 0.125rem 0.5625rem -0.125rem rgba(0, 0, 0, 0.25);
    }

    input[type='range']::-moz-range-thumb {
      pointer-events: all;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 4px solid var(--primary-color);
      background-color: var(--light-color);
      cursor: pointer;
      box-shadow: 0 0.125rem 0.5625rem -0.125rem rgba(0, 0, 0, 0.25);
    }
  }
  &__slider-track {
    position: absolute;
    height: 100%;
    background-color: var(--primary-color);
    border-radius: 4px;
    top: 0;
  }
}
</style>

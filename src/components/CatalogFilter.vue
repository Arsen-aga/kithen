<script setup>
import { ref, onBeforeMount, watch } from 'vue'
import { getData } from '@/api/getData'
import IconArrowLink from '@/components/icons/IconArrowLink.vue'
import IconCheckbox from '@/components/icons/IconCheckbox.vue'
import LinkButton from '@/components/UI/LinkButton.vue'
import RangeInput from '@/components/UI/RangeInput.vue'

const props = defineProps({
  minPrice: Number,
  maxPrice: Number,
})
const emit = defineEmits(['update:min-price', 'update:max-price'])

const catalogCategories = ref('')
onBeforeMount(async () => {
  catalogCategories.value = await getData('../../data/catalogCategories.json')
})

// Используем локальные reactive refs для min и max цены, чтобы отслеживать изменения внутренне
const localMinPrice = ref(props.minPrice)
const localMaxPrice = ref(props.maxPrice)

// При изменении пропсов синхронизируем локальные значения
watch(
  () => props.minPrice,
  (val) => {
    if (val !== undefined) localMinPrice.value = val
  }
)
watch(
  () => props.maxPrice,
  (val) => {
    if (val !== undefined) localMaxPrice.value = val
  }
)

// Обработчики для RangeInput, эмитим обратно обновления в родитель
const updateMinPrice = (val) => {
  localMinPrice.value = val
  emit('update:min-price', val)
}

const updateMaxPrice = (val) => {
  localMaxPrice.value = val
  emit('update:max-price', val)
}

const isShowSubcategory = ref([])

const showSubcategory = (index) => {
  isShowSubcategory.value[index] = true
}

const hideSubcategory = (index) => {
  isShowSubcategory.value[index] = false
}

const isChecked = ref([])
const toggleChecked = (index) => {
  isChecked.value[index] = !isChecked.value[index]
}

const isOpenBrandsList = ref(false)
const openBrandsList = () => {
  isOpenBrandsList.value = !isOpenBrandsList.value
}

const isOpenColorsList = ref(false)
const openColorsList = () => {
  isOpenColorsList.value = !isOpenColorsList.value
}

const brends = ref([
  { id: 0, title: 'Maunfeld' },
  { id: 1, title: 'Korting' },
  { id: 2, title: 'Finish' },
  { id: 3, title: 'Midea' },
  { id: 4, title: 'Korting1' },
  { id: 5, title: 'Korting2' },
])
const colors = ref([
  { id: 0, title: 'Белый' },
  { id: 1, title: 'Серебристый' },
  { id: 2, title: 'Черный' },
  { id: 3, title: 'Нержавеющая сталь' },
  { id: 4, title: 'Серый' },
  { id: 5, title: 'Красный' },
])
</script>

<template>
  <form class="catalog-filter">
    <div class="catalog-filter__item" v-if="catalogCategories.length">
      <h4 class="catalog-filter__item-title">Выбор категории</h4>
      <ul class="catalog-filter__cat">
        <li
          class="catalog-filter__cat-point"
          v-for="(cat, index) in catalogCategories"
          :key="cat.id"
          @mouseover="showSubcategory(index)"
          @mouseout="hideSubcategory(index)"
        >
          <a class="catalog-filter__cat-link" :class="{ hover: isShowSubcategory[index] }" href="#">
            <span v-html="cat.title"></span>
            <IconArrowLink v-if="cat.subCategory?.length" class="catalog-filter__cat-icon" />
          </a>
          <ul class="catalog-filter__subcat" :class="{ show: isShowSubcategory[index] }" v-if="cat.subCategory?.length">
            <li class="catalog-filter__subcat-point" v-for="subcat in cat.subCategory" :key="subcat.id">
              <a class="catalog-filter__subcat-link" href="#">{{ subcat.title }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="catalog-filter__item">
      <h4 class="catalog-filter__item-title">Цена</h4>
      <RangeInput
        class="catalog-filter__price"
        :min-price-value="localMinPrice"
        :max-price-value="localMaxPrice"
        @update:minPrice="updateMinPrice"
        @update:maxPrice="updateMaxPrice"
      />
    </div>
    <div class="catalog-filter__item">
      <h4 class="catalog-filter__item-title">Бренд</h4>
      <div class="catalog-filter__labels">
        <div
          class="catalog-filter__list"
          v-for="brend in isOpenBrandsList ? brends : brends.slice(0, 4)"
          :key="brend.id"
          @click="toggleChecked(brend.title)"
        >
          <input
            class="catalog-filter__list-inp"
            type="checkbox"
            :value="brend.title"
            :checked="isChecked[brend.title]"
          />
          <div class="catalog-filter__list-check">
            <IconCheckbox :is-checked="isChecked[brend.title] || false" color="#EC1111" />
          </div>
          <p class="catalog-filter__list-title">
            {{ brend.title }}
          </p>
        </div>
      </div>
      <LinkButton @click.prevent="openBrandsList">{{ isOpenBrandsList ? 'Скрыть' : 'Открыть' }} все</LinkButton>
    </div>
    <div class="catalog-filter__item">
      <h4 class="catalog-filter__item-title">Цвет</h4>
      <div class="catalog-filter__labels">
        <div
          class="catalog-filter__list"
          v-for="color in isOpenColorsList ? colors : colors.slice(0, 4)"
          :key="color.id"
          @click="toggleChecked(color.title)"
        >
          <input
            class="catalog-filter__list-inp"
            type="checkbox"
            :value="color.title"
            :checked="isChecked[color.title]"
          />
          <div class="catalog-filter__list-check">
            <IconCheckbox :is-checked="isChecked[color.title] || false" color="#EC1111" />
          </div>
          <p class="catalog-filter__list-title">
            {{ color.title }}
          </p>
        </div>
      </div>
      <LinkButton @click.prevent="openColorsList">{{ isOpenColorsList ? 'Скрыть' : 'Открыть' }} все</LinkButton>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.catalog-filter {
  border-right: 1px solid var(--table-color);
  height: fit-content;

  &__item {
    padding: 15px 0;
    border-bottom: 1px solid var(--table-color);
  }
  &__item-title {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 20px;
    line-height: calc(28 / 20 * 100%);
    margin-bottom: 10px;
  }

  &__cat {
    display: grid;
  }

  &__cat-point {
    position: relative;
  }

  &__cat-link {
    font-family: 'Jost';
    font-weight: 400;
    font-size: 16px;
    line-height: calc(24 / 16 * 100%);
    color: var(--default-color);
    display: flex;
    justify-content: space-between;
    gap: 5px;
    transition: all 0.3s ease-in-out;
    padding: 7px 15px 7px 0;

    svg {
      transition: all 0.3s ease-in-out;
    }

    &.hover {
      background-color: var(--page-bg);
      padding-left: 15px;
      color: var(--primary-color);
      font-weight: 500;

      svg {
        stroke: var(--primary-color);
      }
    }
  }

  &__cat-icon {
    margin-top: 10px;
  }

  &__subcat {
    position: absolute;
    top: 0;
    left: 100%;
    z-index: -1;
    opacity: 0;
    background-color: var(--page-bg);
    transition: all 0.3s ease-in-out;
    min-width: 180px;

    &.show {
      opacity: 1;
      z-index: 15;
    }
  }

  &__subcat-link {
    font-family: 'Jost';
    font-weight: 400;
    font-size: 16px;
    line-height: calc(24 / 16 * 100%);
    color: #464451;
    padding: 7px 15px;
    display: block;
    transition: all 0.3s ease-in-out;

    &:hover {
      background-color: var(--light-color);
      color: var(--primary-color);
    }
  }

  &__price {
    padding-right: 15px;
  }

  &__labels {
    display: grid;
    gap: 8px;
    margin-bottom: 7px;
  }

  &__list {
    display: flex;
    gap: 8px;
    cursor: pointer;
  }

  &__list-inp {
    display: none;
  }

  &__list-check {
    width: 18px;
    height: 18px;
    border: 1px solid #dedede;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCatalogBlock } from '@/stores/catalogBlock'
import MainButton from '@/components/UI/MainButton.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import CatalogFilter from '@/components/CatalogFilter.vue'
import CatalogProduct from '@/components/CatalogProduct.vue'
const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
})

const { catalogBlock } = useCatalogBlock()
const closeCatalog = () => {
  catalogBlock.value = []
}

const searchQuery = ref('')

// Значения минимальной и максимальной цены для фильтрации, по умолчанию с диапазоном от минимальной до максимальной цены в товарах
const priceRange = computed(() => {
  if (!props.products.length) {
    return { min: 10000, max: 3130000 }
  }

  const prices = props.products.map((p) => p.Price).filter((price) => price != null)

  if (!prices.length) {
    return { min: 10000, max: 3130000 }
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
})

const minPrice = ref(priceRange.value.min)
const maxPrice = ref(priceRange.value.max)

const filteredProducts = computed(() => {
  return props.products.filter((product) => {
    const matchesSearch = !searchQuery.value || product.Name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesPrice = product.Price >= minPrice.value && product.Price <= maxPrice.value
    console.log(matchesPrice)
    return matchesSearch && matchesPrice
  })
})

watch(priceRange, (newRange) => {
  minPrice.value = newRange.min
  maxPrice.value = newRange.max
})
</script>

<template>
  <div class="catalog-block">
    <div class="catalog-block__top">
      <MainButton class="catalog-block__btn" :show-arrows="true" @click="closeCatalog">Вернуться</MainButton>
      <div class="catalog-block__search-wrapper">
        <IconSearch class="catalog-block__search-icon" />
        <input class="catalog-block__search" type="text" placeholder="Поиск" v-model="searchQuery" />
      </div>
    </div>
    <div class="catalog-block__inner">
      <div class="catalog-block__content">
        <CatalogFilter
          class="catalog-block__filter"
          :min-price="minPrice"
          :max-price="maxPrice"
          @update:min-price="(val) => (minPrice = val)"
          @update:max-price="(val) => (maxPrice = val)"
        />
        <div class="catalog-block__items">
          <CatalogProduct
            class="catalog-block__item"
            v-for="product in filteredProducts"
            :key="product.id + searchQuery + Math.random()"
            :product="product"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.catalog-block {
  padding: 15px 0;

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  }
  &__btn {
    padding: 16px 20px 14px;
  }
  &__search-wrapper {
    position: relative;
  }
  &__search-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 15px;
  }
  &__search {
    max-width: 220px;
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
  &__inner {
    padding: 20px 0;
    max-height: 1320px;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    padding-left: 1px;
  }

  &__content {
    display: grid;
    grid-template-columns: minmax(0, 224px) minmax(0, 1fr);
  }

  &__filter {
    position: sticky;
    box-shadow: 0px -2px 2px -2px rgb(163, 169, 183);
    top: 0;
    z-index: 10;
  }
  &__items {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    position: relative;
  }
}
</style>

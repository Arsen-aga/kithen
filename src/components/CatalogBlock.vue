<script setup>
import { useCatalogBlock } from '@/stores/catalogBlock'
import MainButton from '@/components/UI/MainButton.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import CatalogFilter from '@/components/CatalogFilter.vue'
import CatalogProduct from '@/components/CatalogProduct.vue'
defineProps({
  products: {
    type: Array,
    default: null,
  },
})

const { catalogBlock } = useCatalogBlock()
const closeCatalog = () => {
  catalogBlock.value = []
}
</script>

<template>
  <div class="catalog-block">
    <div class="catalog-block__top">
      <MainButton class="catalog-block__btn" :show-arrows="true" @click="closeCatalog">Вернуться</MainButton>
      <div class="catalog-block__search-wrapper">
        <IconSearch class="catalog-block__search-icon" />
        <input class="catalog-block__search" type="text" placeholder="Поиск" />
      </div>
    </div>
    <div class="catalog-block__inner">
      <div class="catalog-block__content">
        <CatalogFilter class="catalog-block__filter" />
        <div class="catalog-block__items">
          <CatalogProduct
            class="catalog-block__item"
            v-for="product in products"
            :key="product.id"
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

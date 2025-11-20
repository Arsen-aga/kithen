<script setup>
import { useCatalogBlock } from '@/stores/catalogBlock'
const { catalogBlock } = useCatalogBlock()
import { toast } from 'vue3-toastify'

defineProps({
  marketItem: {
    type: Object,
    default: () => ({}),
  },
})

const openCatalog = (category) => {
  if (category.products.length > 0) {
    catalogBlock.value = []
    catalogBlock.value = category.products
  } else {
    toast.error(`Нет товаров в категории ${category.title}`, { autoClose: 1000 })
  }
}
</script>

<template>
  <div class="market-item" @click="() => openCatalog(marketItem)">
    <img
      v-if="marketItem?.image"
      class="market-item__img _img"
      :src="marketItem.image"
      :alt="marketItem.title || 'Product'"
    />
    <div v-else class="market-item__placeholder">No Image</div>
    <div v-if="marketItem?.products?.length" class="market-item__num">
      {{ marketItem.products.length }}
    </div>

    <h4 class="market-item__title">
      {{ marketItem?.title || 'Без названия' }}
    </h4>
  </div>
</template>

<style lang="scss" scoped>
.market-item {
  position: relative;
  overflow: hidden;
  border-radius: 26px;
  height: 280px;
  cursor: pointer;

  img {
    transition: all 0.5s ease-in-out;
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    background: #dba15094;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
  }

  &:hover {
    img {
      scale: 1.5;
    }
  }

  &__num {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: var(--light-color);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    box-shadow: 0px 10px 20px rgba(236, 17, 17, 0.25);
    font-family: 'Jost';
    font-weight: 500;
    font-size: 14px;
    line-height: calc(22 / 14 * 100%);
  }

  &__title {
    position: absolute;
    left: 20px;
    bottom: 20px;
    font-family: 'Jost';
    font-weight: 500;
    font-size: 22px;
    line-height: calc(30 / 22 * 100%);
    color: var(--light-color);
  }
}
</style>

<script setup>
import { ref, watch, computed } from 'vue'
import CheckboxButtonIcon from '@/components/UI/CheckboxButtonIcon.vue'
import IconCart from '@/components/icons/IconCart.vue'
import CheckboxButton from '@/components/UI/CheckboxButton.vue'
import SelectedProduct from '@/components/SelectedProduct.vue'
import { useSmetaStore } from '@/stores/smeta'

const smetaStore = useSmetaStore()
const marketProducts = computed(() => smetaStore.marketSelectProducts || [])
const itemsStates = ref([])
const isChooseAll = ref(false)

const resetCheckStatusProduct = (items) => {
  itemsStates.value = items.map((category) => category.products.map(() => false))
}
const chooseAll = () => {
  const newState = !isChooseAll.value
  itemsStates.value = marketProducts.value.map((category) => Array(category.products.length).fill(newState))
  isChooseAll.value = newState
}

const deleteSelected = () => {
  const deletedProductsIds = getDeletedProducts()
  deletedProductsIds.forEach((productId) => smetaStore.deleteMarketProduct(productId))
  isChooseAll.value = false
  if (marketProducts.value.length) itemsStates.value = resetCheckStatusProduct(marketProducts.value)
}

const getDeletedProducts = () => {
  const deletedProductsIds = []
  itemsStates.value.map((cat, index) => {
    cat.map((p, i) => p && deletedProductsIds.push(marketProducts.value[index].products[i].id))
  })
  return deletedProductsIds
}

const updateStates = (newStates, index) => {
  console.log('newStates', newStates)
  if (itemsStates.value[index]) itemsStates.value[index] = newStates
}

watch(
  () => smetaStore.marketSelectProducts,
  (newItems) => resetCheckStatusProduct(newItems),
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="selected-products">
    <div class="selected-products__btns">
      <CheckboxButton :checked="isChooseAll" class="selected-products__btn" @click="() => chooseAll()">
        <CheckboxButtonIcon :checked="isChooseAll" />
        Выбрать все
      </CheckboxButton>
      <CheckboxButton class="selected-products__btn" @click="deleteSelected">
        <IconCart />
        Удалить выбранные
      </CheckboxButton>
    </div>
    <div class="selected-products__items">
      <SelectedProduct
        class="selected-products__item"
        v-for="(item, index) in marketProducts"
        :key="item.id"
        :item="item"
        :checkStates="itemsStates[index] || []"
        @updateCheckStates="(newStates) => updateStates(newStates, index)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.selected-products {
  padding: 25px 0;

  &__btns {
    display: flex;
    gap: 30px;
    align-items: center;
    margin-bottom: 20px;
  }

  &__items {
    display: grid;
    gap: 20px;
  }
}
</style>

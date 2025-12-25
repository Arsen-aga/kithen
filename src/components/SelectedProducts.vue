<script setup>
import { ref, watch, computed, onMounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})
import CheckboxButtonIcon from '@/components/UI/CheckboxButtonIcon.vue'
import IconCart from '@/components/icons/IconCart.vue'
import CheckboxButton from '@/components/UI/CheckboxButton.vue'
import SelectedProduct from '@/components/SelectedProduct.vue'

const itemsStates = computed(() => props.items.map((category) => category.products.map(() => false)))
const isChooseAll = ref(false)

const chooseAll = () => {
  const newState = !isChooseAll.value
  props.items.forEach((group, i) => {
    group.products.forEach((_, j) => {
      itemsStates[i][j] = newState
    })
  })
  isChooseAll.value = newState
}

// watch(
//   () => itemsStates.value.every((state) => state),
//   (allGroupsSelected) => {
//     isChooseAll.value = allGroupsSelected.every(Boolean)
//   },
//   { deep: true }
// )

const isDeleteAll = ref(false)
const deleteAll = () => {
  isDeleteAll.value = !isDeleteAll.value
}
console.log('props.items', props.items)

const tets = () => {
  console.log('itemsStates.value', itemsStates.value)
}
</script>

<template>
  <div class="selected-products">
    <div class="selected-products__btns">
      <CheckboxButton :checked="isChooseAll" class="selected-products__btn" @click="() => chooseAll()">
        <CheckboxButtonIcon :checked="isChooseAll" />
        Выбрать все
      </CheckboxButton>
      <CheckboxButton class="selected-products__btn" @click="() => deleteAll()">
        <IconCart />
        Удалить выбранные
      </CheckboxButton>
    </div>
    <button @click="tets">tets</button>
    <div class="selected-products__items">
      <SelectedProduct
        class="selected-products__item"
        v-for="(item, index) in props.items"
        :key="item.id"
        :item="item"
        :checkStates="itemsStates[index]"
        @updateCheckStates="itemsStates[index]"
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

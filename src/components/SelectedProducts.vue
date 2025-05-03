<script setup>
import { ref } from 'vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})
import CheckboxButtonIcon from '@/components/UI/CheckboxButtonIcon.vue'
import IconCart from '@/components/icons/IconCart.vue'
import CheckboxButton from '@/components/UI/CheckboxButton.vue'
import SelectedProduct from '@/components/SelectedProduct.vue'

const isChooseAll = ref(false)
const isDeleteAll = ref(false)

const chooseAll = () => {
  isChooseAll.value = !isChooseAll.value
}
const deleteAll = () => {
  isDeleteAll.value = !isDeleteAll.value
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
    <div class="selected-products__items">
      <SelectedProduct class="selected-products__item" v-for="item in items" :key="item.id" :item="item" />
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

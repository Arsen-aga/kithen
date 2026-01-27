<script setup>
import { formatNum } from '@/helpers/formatNum'
import { ref } from 'vue'
import LinkButton from '@/components/UI/LinkButton.vue'
import SmetaModal from '@/components/UI/SmetaModal.vue'

defineProps({
  tableItems: {
    type: Object,
    require: true,
  },
})
const activeModalItem = ref(null)
const activeModalProducts = ref([])

const openModal = (item, products) => {
  activeModalItem.value = item
  activeModalProducts.value = products
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  activeModalItem.value = null
  activeModalProducts.value = []
  document.body.style.overflow = ''
}
</script>

<template>
  <div class="table-item__tr" v-for="item in tableItems" :key="item.key">
    <div class="table-item__td">{{ item.Name }}</div>
    <div class="table-item__td">{{ item.unit || 'шт' }}</div>
    <div class="table-item__td">{{ formatNum(item.Count, 2) }}</div>
    <div class="table-item__td">{{ formatNum(item.Price, 2) }} ₽</div>
    <div class="table-item__td">{{ item.p_sum ? item.p_sum : formatNum(item.Count * item.Price, 2) }} ₽</div>
    <div class="table-item__td"><LinkButton v-if="item.Ar_Specification?.length > 0" class="table-item__link" color="gray" @click="() => openModal(item, item.Ar_Specification)">Заменить материал</LinkButton></div>
    <div class="table-item__td">{{ item.SalePercent ? item.SalePercent + '%' : '' }}</div>
  </div>
    <SmetaModal 
    v-if="activeModalItem !== null && activeModalProducts.length" 
    :products="activeModalProducts" 
    @close-modal="closeModal"
    :replace-item="activeModalItem"
  />
</template>

<style lang="scss" scoped>
.table-item {
  &__tr {
    display: flex;
  }
  &__td {
    border: 1px solid var(--table-color);
    min-height: 60px;
    height: 60px;
    padding: 0 15px;
    font-size: 16px;
    line-height: calc(20 / 16 * 100%);
    font-family: 'Jost';
    text-align: center;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:nth-child(1) {
      text-align: left;
      justify-content: start;
    }
    &:nth-child(2) {
      max-width: 64px;
    }
    &:nth-child(3) {
      max-width: 78px;
    }
    &:nth-child(4) {
      max-width: 127px;
    }
    &:nth-child(5) {
      max-width: 138px;
    }
    &:nth-child(6) {
      max-width: 168px;
    }
    &:nth-child(7) {
      max-width: 82px;
    }
  }

  &__link {
    transition: all 0.3s ease-in-out;

    &:hover {
      color: var(--primary-color);
    }
  }
}
</style>

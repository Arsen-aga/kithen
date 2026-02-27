<script setup>
import { formatNum } from '@/helpers/formatNum'
import { onMounted, onUnmounted } from 'vue'
import LinkButton from '@/components/UI/LinkButton.vue'
import { useSmetaStore } from '@/stores/smeta/index'
const smetaStore = useSmetaStore()


const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  replaceItem: Object,
})
const emit = defineEmits(['close-modal'])

const closeModal = () => {
  emit('close-modal', false)
  document.body.style.overflow = ''
}

const chancgeItem = (newItem) => {
  smetaStore.changeElemInSortSmeta(props.replaceItem, newItem)
  closeModal()
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close-modal', false)
  }
}
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="modal" @click="closeModal">
    <div class="modal__content">
      <div class="modal__block" @click.stop>
        <div class="modal__close" @click="closeModal">x</div>
        <div class="table-block">
          <div class="table-block__head">
            <div class="table-block__tr">
              <div class="table-block__th">Наименование</div>
              <div class="table-block__th">Ед</div>
              <div class="table-block__th">Кол-во</div>
              <div class="table-block__th">Цена</div>
              <div class="table-block__th">Сумма</div>
              <div class="table-block__th">Замена материала</div>
              <div class="table-block__th">Доп. выгода</div>
            </div>
          </div>
          <div class="table-block__body">
            <div class="table-item__tr" v-for="item in products" :key="item.key">
              <div class="table-item__td">{{ item.Name }}</div>
              <div class="table-item__td">{{ item.unit || 'шт' }}</div>
              <div class="table-item__td">{{ formatNum(item.Count, 2) }}</div>
              <div class="table-item__td">{{ formatNum(item.Price, 2) }} ₽</div>
              <div class="table-item__td">{{ item.p_sum ? item.p_sum : formatNum(item.Count * item.Price, 2) }} ₽</div>
              <div class="table-item__td"><LinkButton class="table-item__link" color="gray" @click="() => chancgeItem(item)">Заменить</LinkButton></div>
              <div class="table-item__td">{{ item.SalePercent ? item.SalePercent + '%' : '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 50;
  min-height: 100vh;
  overflow: hidden;
  background-color: rgba($color: #000000, $alpha: 0.05);
  cursor: pointer;

  &__content {
    position: relative;
    padding: 100px 0;
    height: 100%;
    max-height: 100%;
    width: 100%;
    z-index: 1;
    overflow-y: auto;
    display: flex;
    justify-content: center;
  }

  &__block {
    position: relative;
    max-width: 1000px;
    width: 100%;
    background-color: #fff;
    border-radius: 16px;
    padding: 40px;
    height: fit-content;
    cursor: initial;
  }

  &__close {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 18px;
    line-height: 1;
    font-weight: 700;
    text-transform: uppercase;
    background-color: #ec1111;
    cursor: pointer;
    opacity: 0.5;
    transition: all 0.3s ease-in-out;

    &:hover {
      scale: 1.1;
      opacity: 1;
    }
  }
}
.table-block {
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  overflow-y: auto;
  max-width: 930px;

  &__btn {
    margin-bottom: 15px;
  }

  &__head {
    background-color: var(--page-bg);
  }

  &__tr {
    display: flex;
  }

  &__th {
    width: 100%;
    border: 1px solid var(--table-color);
    min-height: 60px;
    padding: 0 15px;
    font-size: 16px;
    line-height: calc(20 / 16 * 100%);
    font-family: 'Jost';
    text-align: center;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;

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

  &__th {
    font-weight: 500;
    padding: 6px 15px;
  }
}
.table-item {
  &__tr {
    display: flex;
  }
  &__td {
    border: 1px solid var(--table-color);
    min-height: 60px;
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

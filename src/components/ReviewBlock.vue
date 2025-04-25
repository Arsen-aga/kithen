<script setup>
// import { computed } from 'vue'
import { useResultItems } from '@/stores/result'
import MainButton from '@/components/UI/MainButton.vue'
import LinkButton from '@/components/UI/LinkButton.vue'
import IconTopLink from '@/components/icons/IconTopLink.vue'
const { resultItems, addPrice, putPrice } = useResultItems()
</script>

<template>
  <div class="review-block">
    <div class="review-block__blocks">
      <div class="review-block__block" v-for="item in resultItems" :key="item.id">
        {{ item.title }}
        {{ item.price }}
      </div>
    </div>
    <div class="review-block__bottom">
      <div class="review-block__btns">
        <MainButton size-button="middle-btn" class="review-block__btn text-red" @click="() => addPrice(500, 1)"
          >Сформировать предложение в PDF</MainButton
        >
        <MainButton size-button="middle-btn" class="review-block__btn text-orange" @click="() => putPrice(200, 4)"
          >Сформировать предложение в DOC</MainButton
        >
      </div>
      <LinkButton class="review-block__link"><IconTopLink /> Поделиться ссылкой</LinkButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.review-block {
  position: fixed;
  background-color: #eeefef;
  border-radius: 30px;
  max-width: 540px;
  width: 100%;
  padding: 50px;
  right: 20px;
  top: 20px;

  &__btns {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 30px 0;
  }

  &__btn {
    max-width: 215px;
  }

  &__link {
    font-size: 18px;
    max-width: 200px;
    margin: 0 auto;
  }
}
</style>

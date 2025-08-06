<script setup>
import { useResultItems } from '@/stores/result'
import MainButton from '@/components/UI/MainButton.vue'
import LinkButton from '@/components/UI/LinkButton.vue'
import IconTopLink from '@/components/icons/IconTopLink.vue'
import ReviewAccordion from '@/components/ReviewAccordion.vue'
const { resultItems, addPrice, putPrice } = useResultItems()
</script>

<template>
  <div class="review-block">
    <div class="review-block__blocks">
      <ReviewAccordion
        class="review-block__block"
        v-for="item in resultItems"
        :key="item.id"
        :item="item"
        :value="item.price ?? item.days"
      />
    </div>
    <div class="review-block__bottom">
      <div class="review-block__btns">
        <MainButton size-button="middle-btn" class="review-block__btn text-red" @click="() => addPrice(500, 310)"
          >Сформировать предложение в PDF</MainButton
        >
        <MainButton size-button="middle-btn" class="review-block__btn text-orange" @click="() => putPrice(200, 141)"
          >Сформировать предложение в DOC</MainButton
        >
      </div>
      <LinkButton class="review-block__link"><IconTopLink /> Поделиться ссылкой</LinkButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.review-block {
  position: sticky;
  background-color: #eeefef;
  border-radius: 30px;
  max-width: 540px;
  width: 100%;
  padding: 50px;
  top: 20px;
  height: fit-content;

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

  &__blocks {
    display: grid;
    gap: 20px;
  }

  &__block {
    padding-bottom: 20px;
    border-bottom: 1px solid rgba($color: #464451, $alpha: 0.2);

    &:last-child {
      padding-bottom: 0;
      padding-right: 34px;
      border: none;
    }
  }
}
</style>

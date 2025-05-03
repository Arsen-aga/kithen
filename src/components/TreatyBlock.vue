<script setup>
import TreatyDetals from '@/components/TreatyDetals.vue'
import TreatyReadinessDates from '@/components/TreatyReadinessDates.vue'
import MainButton from '@/components/UI/MainButton.vue'
import LinkButton from '@/components/UI/LinkButton.vue'
import IconTopLink from '@/components/icons/IconTopLink.vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="treaty-block">
    <TreatyDetals class="treaty-block__detals" :item="items[0]" />
    <TreatyReadinessDates class="treaty-block__dates" :item="items[1]" />
    <div class="treaty-block__bottom">
      <div class="treaty-block__btns">
        <MainButton size-button="big-btn" class="treaty-block__btn text-red">Сформировать предложение в PDF</MainButton>
        <MainButton size-button="big-btn" class="treaty-block__btn text-orange"
          >Сформировать предложение в DOC</MainButton
        >
      </div>
      <LinkButton class="treaty-block__link"><IconTopLink /> Поделиться ссылкой</LinkButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.treaty-block {
  padding-top: 25px;

  &__detals {
    margin-bottom: 10px;
  }

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

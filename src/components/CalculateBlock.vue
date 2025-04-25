<script setup>
import { useAccordionItems } from '@/stores/accordionItems'
import UserBlock from '@/components/UserBlock.vue'
import AccordionItem from '@/components/AccordionItem.vue'
import AccordionSmeta from './AccordionSmeta.vue'

const { accordionItems } = useAccordionItems()
</script>

<template>
  <div class="calculate-block">
    <UserBlock class="calculate-block__header" />
    <div class="calculate-block__accordion">
      <AccordionItem v-for="item in accordionItems" :key="item.id" :content="item">
        <AccordionSmeta v-if="item.id === 0" />
      </AccordionItem>
    </div>
    <UserBlock class="calculate-block__bottom" />
  </div>
</template>

<style lang="scss" scoped>
.calculate-block {
  max-width: 1030px;
  width: 100%;
  background-color: var(--light-color);
  border-radius: 30px;
  padding: 30px 50px;
  margin-left: auto;
  display: flex;
  flex-direction: column;

  &__header {
    margin-bottom: 30px;
  }

  &__accordion {
    display: grid;
    gap: 10px;
  }

  &__bottom {
    margin-top: auto;
    padding-top: 30px;
    border-top: 1px solid rgba($color: #464451, $alpha: 0.1);
  }
}
</style>

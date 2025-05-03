<script setup>
import { ref, onBeforeMount } from 'vue'
import { getData } from '@/api/getData'
import UserBlock from '@/components/UserBlock.vue'
import AccordionItem from '@/components/AccordionItem.vue'
import AccordionSmeta from '@/components/AccordionSmeta.vue'
import MarketBlock from '@/components/MarketBlock.vue'
import SelectedProducts from '@/components/SelectedProducts.vue'
import ScrollTableBlock from '@/components/ScrollTableBlock.vue'
import TreatyBlock from '@/components/TreatyBlock.vue'

const itemSmeta = ref('')
const itemMarket = ref('')
const itemHouseholdAppliances = ref('')
const itemSelectedProducts = ref('')
const itemTechnicallyComplexProducts = ref('')
const itemServices = ref('')
const itemTreaty = ref('')
onBeforeMount(async () => {
  itemSmeta.value = await getData('../../data/smeta.json')
  itemMarket.value = await getData('../../data/market.json')
  itemHouseholdAppliances.value = await getData('../../data/household-appliances.json')
  itemSelectedProducts.value = await getData('../../data/selected-products.json')
  itemTechnicallyComplexProducts.value = await getData('../../data/technically-complex-products.json')
  itemServices.value = await getData('../../data/services.json')
  itemTreaty.value = await getData('../../data/treaty.json')
})
</script>

<template>
  <div class="calculate-block">
    <UserBlock class="calculate-block__header" />
    <div class="calculate-block__accordion">
      <AccordionItem v-if="itemSmeta" :content="itemSmeta">
        <AccordionSmeta :items="itemSmeta.items" />
      </AccordionItem>
      <AccordionItem v-if="itemMarket" :content="itemMarket">
        <MarketBlock :items="itemMarket.items" />
      </AccordionItem>
      <AccordionItem v-if="itemHouseholdAppliances" :content="itemHouseholdAppliances"></AccordionItem>
      <AccordionItem v-if="itemSelectedProducts" :content="itemSelectedProducts">
        <SelectedProducts :items="itemSelectedProducts.items" />
      </AccordionItem>
      <AccordionItem v-if="itemTechnicallyComplexProducts" :content="itemTechnicallyComplexProducts">
        <ScrollTableBlock :items="itemTechnicallyComplexProducts.items" />
      </AccordionItem>
      <AccordionItem v-if="itemServices" :content="itemServices">
        <ScrollTableBlock :items="itemServices.items" />
      </AccordionItem>
      <AccordionItem v-if="itemTreaty" :content="itemTreaty">
        <TreatyBlock :items="itemTreaty.items" />
        <UserBlock class="calculate-block__bottom" />
      </AccordionItem>
    </div>
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
    margin-top: 50px;
    padding-top: 30px;
    border-top: 1px solid rgba($color: #464451, $alpha: 0.1);
  }
}
</style>
